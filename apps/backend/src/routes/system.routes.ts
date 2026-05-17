import { Request, Response, Router } from 'express';
import { prisma } from '../config/prisma';
import { isRedisAvailable } from '../config/redis';
import { asyncHandler } from '../middlewares/asyncHandler';

const router = Router();

router.get('/health', asyncHandler(async (req: Request, res: Response) => {
  const healthStatus: any = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: 'down',
      redis: 'down',
    }
  };

  // Check Database
  try {
    await prisma.$queryRaw`SELECT 1`;
    healthStatus.services.database = 'up';
  } catch {
    healthStatus.services.database = 'down';
  }

  // Check Redis (non-blocking)
  healthStatus.services.redis = isRedisAvailable() ? 'up' : 'down';

  // DB is critical, Redis is optional
  const isHealthy = healthStatus.services.database === 'up';
  
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'success' : 'error',
    data: healthStatus
  });
}));

export default router;
