# Redis & Queue Deployment & Operations Runbook

Complete guide for deploying and operating the Redis + Bull queue system in production.

---

## 🚀 Deployment Steps

### Phase 1: Local Development Setup

#### 1. Install Redis
```bash
# macOS
brew install redis

# Ubuntu/Debian (WSL2)
sudo apt install redis-server redis-tools
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Get Redis CLI
redis-cli ping  # Should return PONG
```

#### 2. Install Dependencies
```bash
cd backend
npm install bull redis nodemailer
```

#### 3. Create `.env`
```env
REDIS_URL=redis://localhost:6379
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@carmella.com
```

#### 4. Test locally
```bash
npm run dev
# Check MongoDB for jobs being written
redis-cli
> KEYS "carmella:*"
```

---

### Phase 2: Lightsail Deployment

#### 1. SSH into Lightsail
```powershell
ssh -i "key.pem" ubuntu@YOUR_IP
```

#### 2. Install Docker (Recommended for Redis)
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Test Docker
docker --version
```

#### 3. Update .env on Server
```bash
# SSH to server
ssh -i "key.pem" ubuntu@YOUR_IP

# Edit backend/.env
nano backend/.env

# Add/Update:
REDIS_URL=redis://redis:6379
```

#### 4. Create Docker Compose (Optional but Easier)
```bash
# Create docker-compose.yml in carmella root
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: carmella-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped
    
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: carmella-backend
    ports:
      - "3000:3000"
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    restart: unless-stopped
    volumes:
      - ./backend:/app

volumes:
  redis_data:
EOF
```

#### 5. Create Backend Dockerfile
```bash
# backend/Dockerfile
cat > backend/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

CMD ["npm", "start"]
EOF
```

#### 6. Deploy with Docker Compose
```bash
# In carmella root directory
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f backend

# Test
curl http://localhost:3000/health
```

---

### Phase 3: Configure Lightsail Firewall

1. **Go to AWS Lightsail Console**
2. **Click your instance**
3. **Go to Networking tab**
4. **Add rule:**
   - **Protocol:** TCP
   - **Port:** 3000 (for API)
   - **Source:** Anywhere (0.0.0.0/0)
5. **Create**

---

### Phase 4: Update Vercel Frontend

1. **Go to Vercel Dashboard**
2. **Settings → Environment Variables**
3. **Update `VITE_API_URL`:**
   ```
   Value: http://YOUR_LIGHTSAIL_IP:3000
   ```
4. **Redeploy**

```bash
# Or manually deploy
vercel --prod
```

---

## 🔍 Monitoring & Maintenance

### 1. Redis Connection Check
```bash
# On Lightsail server
redis-cli ping
# Should return PONG

# Check memory usage
redis-cli INFO memory

# Check connected clients
redis-cli INFO clients

# Monitor in real-time
redis-cli MONITOR
```

### 2. Queue Health Check
```bash
# API endpoint (if implemented)
curl http://YOUR_IP:3000/api/admin/queue-stats

# Manual check via Redis CLI
redis-cli
> KEYS "carmella:*"
> HGETALL "carmella:orders:1"
```

### 3. Check Job Progress
```bash
# Get specific job
redis-cli
> HGETALL "carmella:orders:job:123"

# See active jobs
> LRANGE "carmella:orders:active" 0 -1
```

---

## 🆘 Troubleshooting

### Issue: Redis connection refused
```bash
# Check if Redis is running
docker ps
# or
sudo systemctl status redis-server

# Restart (Docker)
docker-compose restart redis

# Restart (Native)
sudo systemctl restart redis-server

# Check logs
docker-compose logs redis
```

### Issue: Jobs not processing
```bash
# Check if backend is running
docker ps
# or
pm2 status

# Check backend logs
docker-compose logs -f backend
# or
pm2 logs carmella-backend

# Verify environment variables
cat .env | grep REDIS

# Check Redis queue
redis-cli INFO stats
```

### Issue: Out of Memory
```bash
# Check memory
redis-cli INFO memory

# Clear old completed jobs
redis-cli
> FLUSHDB  # ⚠️ Clears ALL Redis data
```

### Issue: Jobs timing out
```bash
# Increase timeout in queue config
// src/config/queues.ts
settings: {
  lockDuration: 60000,  // Increase from 30000
}
```

---

## 📊 Performance Monitoring

### Dashboard Endpoint
```bash
# Create monitoring endpoint (optional)
GET /api/admin/queue-stats → Returns queue statistics
```

### Manual Monitoring Script
```bash
#!/bin/bash
# monitor-queues.sh

while true; do
  clear
  echo "=== CARMELLA QUEUE MONITORING ==="
  echo "Time: $(date)"
  echo ""
  
  redis-cli << EOF
SELECT 0
INFO stats
DBSIZE
EOF
  
  sleep 5
done
```

### Key Metrics to Monitor
- **Pending jobs:** Should be < 1000
- **Active jobs:** Should be < 20
- **Completed daily:** Verify volume
- **Failed jobs:** Should be < 1%
- **Memory usage:** Keep < 80% of available
- **Response time:** Should be < 200ms

---

## 🔧 Production Configuration

### Backend Configuration
```env
# .env (Production)
NODE_ENV=production
REDIS_URL=redis://redis:6379  # Use internal Docker network
QUEUE_ATTEMPTS=5
QUEUE_BACKOFF=exponential
QUEUE_WORKERS=10  # Adjust based on CPU cores
```

### Queue Optimization
```typescript
// src/config/queues.ts (Production)
const redisConfig = {
  redis: REDIS_URL,
  settings: {
    maxStalledCount: 3,           // Retry 3 times if stalled
    lockDuration: 60000,          // 60s lock per job
    lockRenewTime: 30000,         // Renew lock every 30s
    stalledInterval: 10000,       // Check staleness every 10s
    retryProcessDelay: 5000,      // Delay before retry
  },
};
```

### Database Optimization for Queues
```sql
-- Create indexes for queue operations
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_inventory_product ON inventory(product_id);
```

---

## 🚨 Alerts & Notifications

### Critical Issues to Alert On
1. **Redis down** - Queues can't function
2. **High job failure rate** (> 5%)
3. **Queue backlog** (> 5000 pending jobs)
4. **High memory usage** (> 80%)
5. **Duplicate jobs** detected

### Setup Alerts (Example with Slack)
```typescript
// src/utils/alerts.ts
import axios from 'axios';

export async function alertSlack(message: string) {
  await axios.post(process.env.SLACK_WEBHOOK_URL, {
    text: `🚨 CARMELLA ALERT: ${message}`
  });
}

// Use in queue error handlers
orderQueue.on('failed', async (job, err) => {
  if (job.attemptsMade >= 3) {
    await alertSlack(`Order job ${job.id} failed permanently: ${err.message}`);
  }
});
```

---

## 🛞 Maintenance Tasks

### Daily
- [ ] Check queue backlog (should be manageable)
- [ ] Check failed jobs count
- [ ] Monitor server CPU/Memory

### Weekly
- [ ] Review slow job patterns
- [ ] Check Redis memory fragmentation
- [ ] Review application logs

### Monthly
- [ ] Redis backup
- [ ] Performance optimization review
- [ ] Capacity planning

---

## 🔄 Scaling Beyond Single Instance

### When to Scale Redis
- Redis memory > 80% of available
- Queue backlog > 50,000 jobs
- High CPU usage on Redis process

### Scaling Options
1. **Vertical Scaling:** Increase Lightsail instance size ($10 → $20/month)
2. **AWS ElastiCache:** Managed Redis cluster (auto-scaling)
3. **Redis Cluster:** Horizontal partitioning (advanced)

### Recommended Path
```
Start: Single Redis instance + PM2 backend [$5/mo]
     ↓
Growing: Upgrade Lightsail instance size [$10-20/mo]
     ↓
Large:  AWS ElastiCache + Load Balanced backends [$50+/mo]
```

---

## 🆘 Emergency Procedures

### Redis Data Loss Recovery
```bash
# If Redis crashes and loses data:
1. Restart Redis
2. Re-queue critical jobs from database logs
3. Notify users of reprocessing
```

### Job Stuck in Processing
```bash
# If a job is stuck:
redis-cli
> LREM "carmella:orders:active" 1 JOB_ID
# Job will be reprocessed

# Or from API:
DELETE /api/admin/queue/{jobId}
```

### Mass Requeue
```bash
# Requeue all failed jobs
# Create script: requeue-failed.js
const { orderQueue } = require('./queues');
const failed = await orderQueue.getFailed();
for (const job of failed) {
  await job.retry();
}
```

---

## 📋 Checklist: Production Ready

- [ ] Redis installed and running
- [ ] Docker container configured (optional)
- [ ] Environment variables set
- [ ] Database indexes created
- [ ] Monitoring dashboard functional
- [ ] Alert system configured
- [ ] Backup strategy defined
- [ ] Load testing completed
- [ ] Team trained on operations
- [ ] Runbook documented
- [ ] On-call procedures defined
- [ ] Performance baseline established

---

## 📞 Support & Resources

### Getting Help
- **Redis Docs:** https://redis.io/docs/
- **Bull Documentation:** https://github.com/OptimalBits/bull
- **Bull Board (UI):** https://bull-board.js.org/
- **Supabase Docs:** https://supabase.com/docs

### Team Communication
- Create #queues channel in Slack
- Daily standup mentions queue health
- Post-mortem for critical failures

---

## ✅ Final Verification

```bash
# 1. Test Redis connection
redis-cli ping

# 2. Start backend
npm start

# 3. Create test order (should queue immediately)
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# 4. Check order status
curl http://localhost:3000/api/orders/{jobId}/status

# 5. Verify email queued
redis-cli
> KEYS "carmella:emails:*"

# 6. Check metrics
curl http://localhost:3000/api/admin/queue-stats
```

**Expected Output:**
```json
{
  "message": "Order queued for processing",
  "jobId": "12345",
  "status": "processing",
  "estimatedTime": "2-5 seconds"
}
```

✅ **System is operational!**

