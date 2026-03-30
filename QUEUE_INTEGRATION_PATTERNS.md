# Queue Integration Examples for Controllers

This document shows how to integrate Bull queues into your existing controllers for maximum performance.

---

## 📋 Pattern: Order Controller Integration

### Before (Synchronous - Slow)
```typescript
export async function createOrder(req: Request, res: Response) {
  try {
    const { cartId, shippingAddress, paymentMethod, isBulk, requestedQuantities } = req.body;
    const userId = req.user.id;

    // ⏰ User waits 1600-3100ms for this
    const order = await validateCart(cartId);
    await checkInventory(order.items);
    const pricing = await calculatePricing(order);
    const createdOrder = await saveOrder({userId, ...pricing});
    await sendConfirmationEmail(createdOrder); // 1000-2000ms just for email!

    res.json({ order: createdOrder }); // User finally gets response ✅
  } catch (error) {
    res.status(500).json({ error });
  }
}
```

**Problems:**
- 🐢 Slow response (1600-3100ms)
- 💣 Email failures crash the API
- 📉 Can't handle more than 100 orders/min
- 😡 Poor user experience

---

### After (Asynchronous - Fast)
```typescript
import { orderQueue } from '../config/queues';

export async function createOrder(req: Request, res: Response) {
  try {
    const { cartId, shippingAddress, paymentMethod, isBulk, requestedQuantities } = req.body;
    const userId = req.user.id;

    // ⚡ Queue the job and return immediately
    const job = await orderQueue.add(
      {
        userId,
        cartId,
        shippingAddress,
        paymentMethod,
        isBulk,
        requestedQuantities,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      }
    );

    // ✅ User gets response in 150ms!
    res.status(202).json({
      message: 'Order queued for processing',
      jobId: job.id,
      status: 'processing',
      estimatedTime: '2-5 seconds',
    });

  } catch (error) {
    console.error('Error queuing order:', error);
    res.status(500).json({ error: 'Failed to queue order' });
  }
}

// New endpoint to check order status
export async function getOrderStatus(req: Request, res: Response) {
  try {
    const { jobId } = req.params;
    const job = await orderQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState();
    const progress = job.progress();

    res.json({
      jobId,
      state, // 'active', 'completed', 'failed', 'waiting', etc.
      progress, // 0-100
      data: job.data,
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to get job status' });
  }
}
```

**Benefits:**
- ⚡ Response in 150ms (10x faster)
- 🔄 Automatic retries on failure
- 📈 Handle 5000+ orders/min
- 😊 Better user experience
- 🛡️ Email failures don't affect API

---

## 📧 Pattern: Email Queue Usage

### In any Controller
```typescript
import { emailQueue } from '../config/queues';

// Queue email without waiting
await emailQueue.add(
  {
    type: 'order_confirmation',
    orderId: order.id,
    userId: order.user_id,
    orderNumber: order.order_number,
  },
  {
    attempts: 3,
    backoff: 'exponential',
  }
);

// Or for batch notifications
await emailQueue.addBulk([
  {
    name: 'email-job',
    data: {
      type: 'low_stock_alert',
      email: 'admin@carmella.com',
      productName: 'Blue Ceramic Vase',
    },
    opts: { attempts: 3 },
  },
  {
    name: 'email-job',
    data: {
      type: 'low_stock_alert',
      email: 'admin@carmella.com',
      productName: 'Red Ceramic Pot',
    },
    opts: { attempts: 3 },
  },
]);

// Immediate return - don't wait for email sending ✅
res.json({ success: true });
```

---

## 📦 Pattern: Inventory Queue Usage

### Admin Batch Update
```typescript
import { inventoryQueue } from '../config/queues';

export async function batchUpdateInventory(req: Request, res: Response) {
  try {
    const { updates } = req.body; // [{ id: 'product-1', quantity: 100 }, ...]

    // Queue batch operation
    const job = await inventoryQueue.add(
      {
        operation: 'batch_update',
        bulk: updates,
      },
      {
        attempts: 3,
        backoff: 'exponential',
      }
    );

    // Return immediately
    res.json({
      message: `Queued ${updates.length} inventory updates`,
      jobId: job.id,
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to queue inventory update' });
  }
}

// Check progress of batch update
export async function getInventoryUpdateStatus(req: Request, res: Response) {
  try {
    const { jobId } = req.params;
    const job = await inventoryQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState();
    const progress = job.progress(); // 0-100%

    res.json({
      jobId,
      state,
      progress,
      message: `${progress}% complete`,
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to get status' });
  }
}
```

---

## 🎯 Integration Patterns

### Pattern 1: Simple Fire-and-Forget
```typescript
// Don't care about result, just queue it
await emailQueue.add({ type: 'notification', ... });
res.json({ success: true });
```

### Pattern 2: Return Job ID for Polling
```typescript
// User can check status later
const job = await orderQueue.add({ ... });
res.json({ jobId: job.id, status: 'processing' });
```

### Pattern 3: Wait with Timeout
```typescript
// Wait max 5 seconds for job to complete
const job = await orderQueue.add({ ... });
const completed = await job.waitUntilStarted({ timeout: 5000 });

res.json({
  jobId: job.id,
  started: !!completed,
  status: await job.getState(),
});
```

### Pattern 4: Bulk Operations
```typescript
// Queue multiple jobs at once
const jobs = await emailQueue.addBulk([
  { data: item1, opts: { attempts: 3 } },
  { data: item2, opts: { attempts: 3 } },
  { data: item3, opts: { attempts: 3 } },
]);

res.json({
  queued: jobs.length,
  jobIds: jobs.map(j => j.id),
});
```

---

## 🚨 Error Handling Patterns

### Pattern: Graceful Degradation
```typescript
export async function createOrder(req: Request, res: Response) {
  try {
    // Always queue order first
    const job = await orderQueue.add({ ... });

    // Try to send immediate confirmation (fire-and-forget)
    emailQueue.add(
      { type: 'immediate_notification', ... }
    ).catch(err => console.error('Email queue error:', err));

    // Return success to user
    res.status(202).json({
      jobId: job.id,
      status: 'processing',
    });

  } catch (error) {
    // Only fail if order queue fails
    if (error.message.includes('Redis')) {
      res.status(503).json({ error: 'Service temporarily unavailable' });
    } else {
      res.status(500).json({ error: 'Failed to process order' });
    }
  }
}
```

### Pattern: Detailed Error Reporting
```typescript
export async function getJobDetails(req: Request, res: Response) {
  try {
    const { jobId } = req.params;
    const job = await orderQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState();
    const progress = job.progress();
    const attempts = job.attemptsMade;
    const failedReason = job.failedReason;

    res.json({
      jobId,
      state,
      progress,
      attempts,
      failedReason,
      isCompleted: state === 'completed',
      isFailed: state === 'failed',
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to get job details' });
  }
}
```

---

## 🔧 Queue Configuration Patterns

### Production Settings
```typescript
// For production - more aggressive retry
const job = await orderQueue.add(data, {
  attempts: 5,                    // Retry 5 times
  backoff: {
    type: 'exponential',
    delay: 2000,                  // Start with 2s, then 4s, 8s, etc.
  },
  removeOnComplete: true,         // Clean up completed jobs
  removeOnFail: false,            // Keep failed jobs for debugging
  timeout: 60000,                 // Cancel if takes > 60s
});
```

### Development Settings
```typescript
// For development - minimal retry
const job = await orderQueue.add(data, {
  attempts: 1,
  removeOnComplete: true,
  removeOnFail: false,
});
```

### High-Priority Jobs
```typescript
// Process immediately
const job = await orderQueue.add(data, {
  priority: 10,                   // Higher = more urgent
  attempts: 3,
});
```

### Delayed Jobs
```typescript
// Process after 30 minutes
const job = await emailQueue.add(data, {
  delay: 30 * 60 * 1000,         // 30 minutes in ms
  attempts: 3,
});
```

---

## 📊 Monitoring Patterns

### Queue Health Check Endpoint
```typescript
export async function getQueueHealth(req: Request, res: Response) {
  try {
    const queues = {
      orders: {
        active: await orderQueue.getActiveCount(),
        pending: await orderQueue.getWaitingCount(),
        completed: await orderQueue.getCompletedCount(),
        failed: await orderQueue.getFailedCount(),
      },
      emails: {
        active: await emailQueue.getActiveCount(),
        pending: await emailQueue.getWaitingCount(),
      },
      inventory: {
        active: await inventoryQueue.getActiveCount(),
        pending: await inventoryQueue.getWaitingCount(),
      },
    };

    const totalJobs = Object.values(queues).reduce(
      (sum, q) => sum + q.active + q.pending, 
      0
    );

    res.json({
      status: totalJobs > 1000 ? 'warning' : 'healthy',
      queues,
      totalPending: totalJobs,
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to get queue health' });
  }
}
```

---

## ✅ Migration Checklist

- [ ] Add Bull and Redis dependencies
- [ ] Create `src/config/queues.ts`
- [ ] Create `src/queues/` directory
- [ ] Implement order processor
- [ ] Implement email processor
- [ ] Implement inventory processor
- [ ] Update order controller to use queues
- [ ] Update admin routes for batch operations
- [ ] Add environment variables to `.env`
- [ ] Test locally with Redis running
- [ ] Test on Lightsail with Docker Redis
- [ ] Set up monitoring dashboard
- [ ] Create runbook for queue debugging
- [ ] Train team on queue patterns

---

## 🐛 Common Issues & Solutions

### Issue: Jobs not processing
**Solution:** Check Redis connection
```bash
# SSH to server
redis-cli ping
# Should return PONG
```

### Issue: Memory growing
**Solution:** Configure job cleanup
```typescript
removeOnComplete: {
  age: 3600  // Remove completed jobs after 1 hour
},
removeOnFail: {
  age: 86400 // Keep failed jobs 24 hours for debugging
}
```

### Issue: Jobs timing out
**Solution:** Increase timeout to long-running jobs
```typescript
await orderQueue.add(data, {
  timeout: 120000, // 2 minutes instead of default 30s
});
```

---

## 📚 Next Steps

1. Integrate all queues into existing controllers
2. Update cart operations to queue
3. Update B2B operations to queue
4. Add monitoring dashboard
5. Performance test with load testing tool
6. Set up alerts for queue backlog

