import Queue from 'bull';

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

// Create queues
export const orderQueue = new Queue('orders', redisConfig);
export const emailQueue = new Queue('emails', redisConfig);
export const inventoryQueue = new Queue('inventory', redisConfig);
export const analyticsQueue = new Queue('analytics', redisConfig);
export const b2bQueue = new Queue('b2b-requests', redisConfig);
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
