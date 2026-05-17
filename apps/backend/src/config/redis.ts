import Redis from 'ioredis';

let redisConnection: Redis | null = null;
let redisAvailable = false;

const getRedisConfig = () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  retryStrategy: (times: number) => {
    if (times > 3) {
      console.warn('⚠️  Redis unavailable — running without cache/queues');
      return null; // Stop retrying
    }
    return Math.min(times * 200, 2000);
  },
  lazyConnect: true,
});

export const getRedisConnection = (): Redis => {
  if (!redisConnection) {
    redisConnection = new Redis(getRedisConfig());

    redisConnection.on('error', (error) => {
      if (redisAvailable) {
        console.error('Redis connection lost:', error.message);
      }
      redisAvailable = false;
    });

    redisConnection.on('connect', () => {
      redisAvailable = true;
      console.log('🚀 Redis connected');
    });
  }
  return redisConnection;
};

export const isRedisAvailable = (): boolean => redisAvailable;

export const tryRedisConnect = async (): Promise<boolean> => {
  try {
    const conn = getRedisConnection();
    await conn.connect();
    return true;
  } catch {
    console.warn('⚠️  Redis not available — app will run without background jobs');
    return false;
  }
};
