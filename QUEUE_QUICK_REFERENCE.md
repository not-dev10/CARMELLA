# Redis & Queue Quick Reference Card

## 📋 Phase 1: Setup Checklist

### Local Development
- [ ] Install Redis: `brew install redis` (macOS) or `apt install redis-server` (WSL)
- [ ] Start Redis: `redis-server`
- [ ] Install packages: `npm install` in backend
- [ ] Copy `.env.example` to `.env` and update values
- [ ] Start backend: `npm run dev`

### Verify Locally
- [ ] Test Redis connection: `redis-cli ping`
- [ ] Check queue files exist:
  - `src/config/queues.ts`
  - `src/queues/orderProcessor.ts`
  - `src/queues/emailProcessor.ts`
  - `src/queues/inventoryProcessor.ts`
- [ ] Backend logs show "✅ Queue processors initialized"
- [ ] Create test order and see 150ms response (async)

---

## 🚀 Controller Integration Template

### Before (Synchronous)
```typescript
export async function createOrder(req, res) {
  // ... validation ...
  const order = await processOrderSync(); // 1600ms ⏱️
  res.json({ order }); // Slow user experience 😞
}
```

### After (Asynchronous)
```typescript
import { orderQueue } from '../config/queues';

export async function createOrder(req, res) {
  // ... validation ...
  const job = await orderQueue.add(jobData, { attempts: 3 });
  res.status(202).json({ jobId: job.id, status: 'processing' }); // 150ms ⚡
}

// Add status checker
export async function getOrderStatus(req, res) {
  const { jobId } = req.params;
  const job = await orderQueue.getJob(jobId);
  const state = await job.getState();
  res.json({ state, progress: job.progress() });
}
```

---

## 🔧 Common Queue Operations

### Add a Job
```typescript
const job = await orderQueue.add(
  { userId, cartId, ... },
  { attempts: 3, backoff: 'exponential' }
);
```

### Check Job Status
```typescript
const job = await orderQueue.getJob(jobId);
const state = await job.getState(); // 'active' | 'completed' | 'failed'
const progress = job.progress(); // 0-100
```

### Retry Failed Job
```typescript
const job = await orderQueue.getJob(jobId);
await job.retry();
```

### Get Queue Stats
```typescript
const active = await orderQueue.getActiveCount();
const pending = await orderQueue.getWaitingCount();
const failed = await orderQueue.getFailedCount();
```

---

## 🔴 Common Issues & Quick Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Jobs not processing | Redis not running | `redis-server` or restart Docker |
| Connection refused | Wrong REDIS_URL in .env | Update `.env`: `redis://localhost:6379` |
| Jobs timeout | Long-running operation | Increase timeout in queue config |
| Memory grows | Jobs not cleaning up | Add `removeOnComplete: true` |
| Errors in logs | Email config wrong | Check `.env` SMTP credentials |

---

## 📊 Deployment Checklist

### Pre-Deployment
- [ ] All queue files created
- [ ] package.json updated
- [ ] .env.example updated
- [ ] Local testing complete
- [ ] Team reviewed documentation

### Lightsail Deployment
- [ ] SSH to instance
- [ ] Install Redis (Docker or native)
- [ ] Pull latest code
- [ ] Install dependencies: `npm install`
- [ ] Update `.env` with Lightsail IP
- [ ] Start system: `docker-compose up` or `pm2 start`
- [ ] Verify: `redis-cli ping` returns PONG
- [ ] Test API: `curl http://IP:3000/health`

### Frontend Update
- [ ] Update Vercel `VITE_API_URL` to Lightsail IP
- [ ] Redeploy frontend
- [ ] Test end-to-end

---

## 📈 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Order response | < 200ms | Plan: 150ms |
| Queue backlog | < 1000 | Monitoring |
| Email delivery | < 2min | Background |
| Failed jobs | < 1% | Retry enabled |
| Server CPU | < 60% | ⬆️ Much better |

---

## 🎯 Integration Priority

### Week 1 (P1)
1. Order processing queue
2. Email queue
3. Basic monitoring

### Week 2-3 (P2)
4. Inventory queue
5. Analytics refresh queue
6. Dashboard improvements

### Week 4+ (P3+)
7. B2B queue
8. Category queue
9. Advanced monitoring

---

## 📞 Emergency Contacts

### Issue: Queue Completely Down
1. Check Redis: `redis-cli`
2. Check backend logs: `docker logs backend`
3. Restart: `docker-compose restart`

### Issue: Jobs Stuck
1. Check active jobs: `redis-cli LRANGE carmella:orders:active 0 -1`
2. Manually retry: `DELETE /api/admin/queue/{jobId}`

### Issue: Memory Critical
1. Check: `redis-cli INFO memory`
2. Upgrade Lightsail instance
3. Or switch to AWS ElastiCache

---

## 🔗 Documentation Links

- 📖 Full Setup: [QUEUE_IMPLEMENTATION_GUIDE.md](QUEUE_IMPLEMENTATION_GUIDE.md)
- 🏗️ Architecture: [BACKEND_ARCHITECTURE_ANALYSIS.md](BACKEND_ARCHITECTURE_ANALYSIS.md)
- 🔧 Operations: [REDIS_QUEUE_OPERATIONS_RUNBOOK.md](REDIS_QUEUE_OPERATIONS_RUNBOOK.md)
- 💡 Patterns: [QUEUE_INTEGRATION_PATTERNS.md](QUEUE_INTEGRATION_PATTERNS.md)
- 📋 Summary: [REDIS_IMPLEMENTATION_SUMMARY.md](REDIS_IMPLEMENTATION_SUMMARY.md)

---

## 🧪 Testing Commands

### Test Order Queue
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer TOKEN" \
  -d '{"cartId":"test", "shippingAddress":{}, "paymentMethod":"card"}'
# Returns: { jobId: "123", status: "processing" }
```

### Check Queue Health
```bash
redis-cli
> KEYS "carmella:*"  # See all queue keys
> DBSIZE             # Total keys in Redis
> INFO stats         # Queue statistics
```

### Monitor in Real-Time
```bash
redis-cli MONITOR  # See all commands
# Ctrl+C to exit
```

---

## 💾 Environment Variables

```env
# Required
REDIS_URL=redis://localhost:6379

# For Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@carmella.com

# Optional/Advanced
NODE_ENV=production
QUEUE_ATTEMPTS=3
QUEUE_BACKOFF=exponential
```

---

## ⏱️ Expected Timelines

| Task | Time | Status |
|------|------|--------|
| Local setup | 30min | ⏱️ |
| Integration | 4-6h | 📅 |
| Testing | 2-3h | 🧪 |
| Deployment | 1-2h | 🚀 |
| **Total** | **~1 week** | ✅ |

---

## 🎓 Key Concepts

### Queue: Line of jobs waiting to be processed
```
[Job1] [Job2] [Job3] → Worker → Processed
```

### Bull: Manages the queue and workers
```
API → Add Job → Redis Queue → Bull Worker → Database
```

### Redis: Stores the queue in memory (fast)
```
Lightning fast storage for job data
```

### Async Pattern: Don't wait for results
```
API: "I'll do it later" → Return immediately ⚡
Worker: Process in background
```

---

## ✅ Success Indicators

System is working well when:
- ✅ Order response < 200ms
- ✅ Emails send within 2 minutes
- ✅ Can handle 1000+ orders/min
- ✅ No jobs stuck in processing
- ✅ Redis memory < 500MB
- ✅ Server CPU < 60%

---

## 🚀 Go Live Checklist

- [ ] All files created and tested locally
- [ ] Team trained on queue patterns
- [ ] Deployment runbook reviewed
- [ ] Redis running on Lightsail
- [ ] Backend deployed
- [ ] Frontend API URL updated
- [ ] End-to-end testing complete
- [ ] Monitoring dashboard ready
- [ ] Alert system configured
- [ ] Backup strategy in place

**Ready to deploy!** 🎉

