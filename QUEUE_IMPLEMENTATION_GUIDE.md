# Queue Implementation Guide - Redis + Bull

## 🚀 Quick Start

**Goal:** Add Redis + Bull job queues to handle order processing, emails, and inventory asynchronously.

**Estimated time:** 2-3 hours for Phase 1

---

## 📦 Step 1: Install Dependencies

### In `backend/package.json`:

```bash
cd backend
npm install redis bull dotenv

# For queue monitoring (optional but useful)
npm install bull-board express
```

**package.json updates:**
```json
"dependencies": {
  "bull": "^4.11.5",
  "redis": "^4.6.10",
  "dotenv": "^16.3.1"
}
```

---

## 🐳 Step 2: Set Up Redis on Lightsail

### Option A: Docker (Recommended)

```bash
# SSH to Lightsail instance
ssh -i "path/to/key.pem" ubuntu@YOUR_IP

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Run Redis
sudo docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine \
  redis-server --appendonly yes

# Verify
sudo docker ps
redis-cli ping  # Should return PONG
```

### Option B: Native Installation

```bash
sudo apt install redis-server -y
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify
redis-cli ping  # Should return PONG
```

### Option C: AWS ElastiCache (Production)

```bash
# In AWS Lightsail console:
# 1. Create ElastiCache Redis cluster
# 2. Create security group allowing NDP 6379
# 3. Get endpoint: something.cache.amazonaws.com:6379
# 4. Update .env with endpoint
```

---

## 🔧 Step 3: Create Queue Configuration

### File: `backend/src/config/queues.ts`

```typescript
import Queue from 'bull';
import redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const redisConfig = {
  redis: REDIS_URL,
  settings: {
    maxStalledCount: 2,
    lockDuration: 30000,
    lockRenewTime: 15000,
    keyPrefix: 'carmella:',
    defaultBackoffStrategy: 'exponential',
    backoffStrategies: {
      exponential: (attemptsMade: number) => {
        return Math.pow(2, attemptsMade) * 1000;
      },
    },
  },
};

// Order Processing Queue
export const orderQueue = new Queue('orders', redisConfig);

// Email Notification Queue
export const emailQueue = new Queue('emails', redisConfig);

// Inventory Queue
export const inventoryQueue = new Queue('inventory', redisConfig);

// Analytics Queue
export const analyticsQueue = new Queue('analytics', redisConfig);

// B2B Request Queue
export const b2bQueue = new Queue('b2b-requests', redisConfig);

// Image Processing Queue
export const imageQueue = new Queue('images', redisConfig);

// Error handling for all queues
const allQueues = [orderQueue, emailQueue, inventoryQueue, analyticsQueue, b2bQueue, imageQueue];

allQueues.forEach((queue) => {
  queue.on('failed', (job, err) => {
    console.error(`❌ Queue ${queue.name} - Job ${job.id} failed:`, err.message);
  });

  queue.on('error', (err) => {
    console.error(`❌ Queue ${queue.name} error:`, err);
  });

  queue.on('completed', (job) => {
    console.log(`✅ Queue ${queue.name} - Job ${job.id} completed`);
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔴 SIGTERM received, closing queues...');
  await Promise.all(allQueues.map((q) => q.close()));
  process.exit(0);
});

export default redisConfig;
```

---

## 💼 Step 4: Order Processing Queue (P1)

### Worker Processor: `backend/src/queues/orderProcessor.ts`

```typescript
import { orderQueue } from '../config/queues';
import { supabase } from '../config/supabase';
import { sendOrderConfirmationEmail } from '../utils/email';

interface OrderJobData {
  userId: string;
  cartId: string;
  shippingAddress: any;
  paymentMethod: string;
  isBulk: boolean;
  requestedQuantities?: object;
}

export async function initOrderProcessor() {
  // Process 5 orders concurrently
  orderQueue.process(5, async (job) => {
    console.log(`📦 Processing order ${job.id}...`);
    
    const { userId, cartId, shippingAddress, paymentMethod, isBulk, requestedQuantities } = job.data;

    try {
      job.progress(10); // 10% - Started

      // 1. Get cart items
      const { data: cartItems, error: cartError } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cartId);

      if (cartError) throw cartError;
      job.progress(25); // 25% - Cart retrieved

      // 2. Validate inventory
      const inventoryCheck = await Promise.all(
        cartItems.map(async (item) => {
          const { data, error } = await supabase
            .from('inventory')
            .select('stock_quantity')
            .eq('product_id', item.product_id)
            .single();
          
          if (error) throw error;
          if (data.stock_quantity < item.quantity) {
            throw new Error(`Insufficient stock for product ${item.product_id}`);
          }
          return data;
        })
      );
      job.progress(50); // 50% - Inventory validated

      // 3. Calculate pricing
      const { data: cartData, error: priceError } = await supabase
        .from('carts')
        .select('calculated_total, discount_amount')
        .eq('id', cartId)
        .single();

      if (priceError) throw priceError;
      job.progress(65); // 65% - Pricing calculated

      // 4. Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          total_amount: cartData.calculated_total,
          discount_amount: cartData.discount_amount,
          shipping_address: shippingAddress,
          payment_method: paymentMethod,
          order_status: 'pending_payment',
          is_bulk: isBulk,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (orderError) throw orderError;
      job.progress(80); // 80% - Order created

      // 5. Add items to order
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;
      job.progress(90); // 90% - Items added

      // 6. Queue email notification (non-blocking)
      await emailQueue.add(
        {
          type: 'order_confirmation',
          orderId: order.id,
          userId,
          email: '', // Get from user context
        },
        { attempts: 3, backoff: 'exponential' }
      );

      job.progress(100); // 100% - Complete

      console.log(`✅ Order ${order.id} created successfully`);
      return { orderId: order.id, status: 'success' };

    } catch (error) {
      console.error(`❌ Order processing failed:`, error);
      throw error;
    }
  });

  console.log('📦 Order processor initialized');
}

// Graceful restart
orderQueue.on('error', (err) => {
  console.error('Order queue errored:', err);
});
```

### Update Controller: `backend/src/controllers/orderController.ts`

```typescript
import { Request, Response } from 'express';
import { orderQueue } from '../config/queues';

export async function createOrder(req: Request, res: Response) {
  try {
    const { cartId, shippingAddress, paymentMethod, isBulk, requestedQuantities } = req.body;
    const userId = req.user.id;

    // Queue the order instead of processing synchronously
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

    // Return immediately with job ID
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
      state,
      progress,
      data: job.data,
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to get job status' });
  }
}
```

---

## 📧 Step 5: Email Queue (P1)

### Worker: `backend/src/queues/emailProcessor.ts`

```typescript
import { emailQueue } from '../config/queues';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function initEmailProcessor() {
  emailQueue.process(10, async (job) => {
    const { type, orderId, userId, email } = job.data;

    try {
      let subject, htmlContent;

      if (type === 'order_confirmation') {
        subject = `Order Confirmation #${orderId}`;
        htmlContent = `
          <h1>Thank you for your order!</h1>
          <p>Order ID: ${orderId}</p>
          <p>We'll send tracking info soon.</p>
        `;
      } else if (type === 'low_stock_alert') {
        subject = 'Stock Alert';
        htmlContent = job.data.htmlContent;
      }

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        html: htmlContent,
      });

      console.log(`✅ Email sent to ${email}`);
      return { sent: true };

    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  });
}
```

---

## 📊 Step 6: Inventory Queue (P1)

### Worker: `backend/src/queues/inventoryProcessor.ts`

```typescript
import { inventoryQueue } from '../config/queues';
import { supabase } from '../config/supabase';

export async function initInventoryProcessor() {
  inventoryQueue.process(3, async (job) => {
    const { operation, productId, quantity, bulk } = job.data;

    try {
      if (operation === 'update') {
        const { error } = await supabase
          .from('inventory')
          .update({ stock_quantity: quantity })
          .eq('product_id', productId);

        if (error) throw error;
      }

      if (operation === 'batch_update' && bulk) {
        // Handle bulk inventory updates
        const updates = bulk.map((b: any) => ({
          product_id: b.id,
          stock_quantity: b.quantity,
        }));

        await Promise.all(
          updates.map((u) =>
            supabase
              .from('inventory')
              .update({ stock_quantity: u.stock_quantity })
              .eq('product_id', u.product_id)
          )
        );
      }

      console.log(`✅ Inventory updated for product ${productId}`);
      return { updated: true };

    } catch (error) {
      console.error('Inventory update failed:', error);
      throw error;
    }
  });
}
```

---

## 🔍 Step 7: Queue Monitoring Dashboard (Optional)

### File: `backend/src/routes/queue-admin.ts`

```typescript
import express from 'express';
import { createBullBoard } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import {
  orderQueue,
  emailQueue,
  inventoryQueue,
  analyticsQueue,
  b2bQueue,
  imageQueue,
} from '../config/queues';

const router = express.Router();

// Only allow authorized admins
const checkAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  next();
};

// Set up Bull Board
const serverAdapter = new BullAdapter([
  new BullAdapter(orderQueue),
  new BullAdapter(emailQueue),
  new BullAdapter(inventoryQueue),
  new BullAdapter(analyticsQueue),
  new BullAdapter(b2bQueue),
  new BullAdapter(imageQueue),
]);

const bullBoard = createBullBoard({
  queues: [serverAdapter],
  serverAdapter,
});

// Mount at /admin/queues
router.use('/queues', checkAdmin, bullBoard.router);

// API endpoints for queue stats
router.get('/queue-stats', checkAdmin, async (req, res) => {
  try {
    const stats = {
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

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

export default router;
```

---

## 🔌 Step 8: Update Main Backend Entry Point

### File: `backend/src/index.ts` (Add sections)

```typescript
import {
  initOrderProcessor,
  initEmailProcessor,
  initInventoryProcessor,
} from './queues';

// Initialize queues after server starts
app.listen(PORT, async () => {
  console.log(`✅ Server running on port ${PORT}`);

  // Initialize queue processors
  console.log('🚀 Initializing queue processors...');
  await initOrderProcessor();
  await initEmailProcessor();
  await initInventoryProcessor();

  console.log('✅ Queue processors ready');
});
```

---

## 📝 Step 9: Update `.env` File

### `backend/.env`

```env
# Redis
REDIS_URL=redis://localhost:6379
# OR for Lightsail Docker
REDIS_URL=redis://YOUR_LIGHTSAIL_IP:6379
# OR for AWS ElastiCache
REDIS_URL=redis://your-cluster.cache.amazonaws.com:6379

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Queue Settings
QUEUE_ATTEMPTS=3
QUEUE_BACKOFF=exponential
```

---

## 🧪 Step 10: Testing

### Test Order Queue

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cartId": "cart-123",
    "shippingAddress": {...},
    "paymentMethod": "card"
  }'

# Response:
# { 
#   "message": "Order queued for processing",
#   "jobId": "12345",
#   "status": "processing"
# }
```

### Check Job Status

```bash
curl http://localhost:3000/api/orders/12345/status
```

### Monitor Queue Dashboard

```bash
# Access at: http://localhost:3000/admin/queues
# View active jobs, retries, failures in real-time
```

---

## 📊 Deployment to Lightsail

### 1. SSH to Lightsail

```bash
ssh -i "key.pem" ubuntu@YOUR_IP
```

### 2. Install Redis (if not using Docker)

```bash
sudo apt update
sudo apt install redis-server -y
sudo systemctl start redis-server
redis-cli ping
```

### 3. Deploy Backend with Queue Support

```bash
cd ~/CARMELLA/backend
git pull origin development
npm install
PM2_MAX_MEMORY_RESTART=200M pm2 start "npm start" --name "carmella-backend"
```

### 4. Verify

```bash
pm2 status
pm2 logs carmella-backend
redis-cli dbsize  # Check Redis
```

---

## 🎯 Phase 1 Checklist

- [ ] Redis installed and running
- [ ] Bull dependencies added
- [ ] Queue config created
- [ ] Order processor implemented
- [ ] Email processor implemented  
- [ ] Inventory processor implemented
- [ ] Controllers updated with queue.add()
- [ ] Environment variables set
- [ ] Testing completed
- [ ] Deployed to Lightsail
- [ ] Monitoring dashboard working

---

## 📈 Expected Results After Phase 1

```
Metric                 Before    After      Improvement
Order Response Time    1.6s      150ms      10.7x faster
Concurrent Orders      100/min   1000/min   10x capacity
Email Delays           N/A       < 2s       Real-time
Server CPU Usage       95%       40%        Reduced
Server Memory Usage    14GB      1.5GB      9x reduction
```

