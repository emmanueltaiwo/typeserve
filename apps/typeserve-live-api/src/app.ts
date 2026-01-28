import express, { Express, Request, Response, NextFunction } from 'express';
import { ServerService } from './services/server.service.js';
import { RedisService } from './services/redis.service.js';
import { createServersRouter } from './routes/servers.routes.js';
import { createSubdomainHandler } from './handlers/subdomain.handler.js';

export function createApp(
  serverService: ServerService,
  redisService?: RedisService
): Express {
  const app = express();

  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (
      origin &&
      (origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.includes('typeserve.live'))
    ) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }

    next();
  });

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  app.use((req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          error: 'request_timeout',
          message: 'Request timeout',
        });
      }
    }, 30000);

    res.on('finish', () => clearTimeout(timeout));
    next();
  });
  app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    (req as any).requestId = requestId;
    res.setHeader('X-Request-ID', requestId);

    const startTime = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      console.log(
        `[${new Date().toISOString()}] [${requestId}] ${req.method} ${req.path} - ${req.hostname} - ${res.statusCode} - ${duration}ms`
      );
    });

    next();
  });

  app.get('/health', async (req: Request, res: Response) => {
    try {
      if (redisService) {
        await redisService.getActiveServerCount();
      }

      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Redis connection failed',
      });
    }
  });

  // API routes
  app.use('/servers', createServersRouter(serverService));

  // Subdomain handler (must be last to catch all subdomain requests)
  app.use(createSubdomainHandler(serverService));

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'not_found',
      message: `Route ${req.method} ${req.path} not found`,
    });
  });

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    const requestId = (req as any).requestId || 'unknown';
    console.error(`[App] [${requestId}] Unhandled error:`, err);

    const isDevelopment = process.env.NODE_ENV !== 'production';
    const message = isDevelopment
      ? err.message || 'Internal server error'
      : 'Internal server error';

    res.status(500).json({
      error: 'internal_error',
      message,
      requestId,
    });
  });

  return app;
}
