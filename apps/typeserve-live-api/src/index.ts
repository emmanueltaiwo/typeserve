import 'dotenv/config';

import { createApp } from './app';
import { RedisService } from './services/redis.service';
import { BullMQService } from './services/bullmq.service';
import { ServerService } from './services/server.service';
import { CleanupService } from './services/cleanup.service';

async function main() {
  const port = parseInt(process.env.PORT || '7005', 10);

  const redisUrl = process.env.REDIS_URL;
  const redisService = new RedisService(redisUrl);
  const bullMQService = new BullMQService(redisService, redisUrl);
  const serverService = new ServerService(redisService, bullMQService);
  const cleanupService = new CleanupService(redisService);

  const app = createApp(serverService, redisService);

  // Start periodic cleanup service (runs every 5 minutes)
  cleanupService.start();

  const server = app.listen(port, () => {
    console.log(`[Typeserve Live API] Server running on port ${port}`);
    console.log(
      `[Typeserve Live API] Environment: ${process.env.NODE_ENV || 'development'}`
    );
    console.log(`[Typeserve Live API] Redis: ${redisUrl || 'localhost:6379'}`);
  });

  const shutdown = async (signal: string) => {
    console.log(
      `\n[Typeserve Live API] Received ${signal}, shutting down gracefully...`
    );

    server.close(async () => {
      console.log('[Typeserve Live API] HTTP server closed');

      // Stop periodic cleanup
      if (cleanupService) {
        cleanupService.stop();
      }

      try {
        await bullMQService.close();
        console.log('[Typeserve Live API] BullMQ closed');
      } catch (error) {
        console.error('[Typeserve Live API] Error closing BullMQ:', error);
      }

      try {
        await redisService.close();
        console.log('[Typeserve Live API] Redis closed');
      } catch (error) {
        console.error('[Typeserve Live API] Error closing Redis:', error);
      }

      console.log('[Typeserve Live API] Shutdown complete');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('[Typeserve Live API] Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('uncaughtException', (error) => {
    console.error('[Typeserve Live API] Uncaught exception:', error);
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error(
      '[Typeserve Live API] Unhandled rejection at:',
      promise,
      'reason:',
      reason
    );
  });

  // Handle memory warnings
  if (process.memoryUsage) {
    setInterval(() => {
      const usage = process.memoryUsage();
      const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);

      // Warn if heap usage exceeds 500MB
      if (heapUsedMB > 500) {
        console.warn(
          `[Typeserve Live API] High memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB`
        );
      }
    }, 60000); // Check every minute
  }
}

main().catch((error) => {
  console.error('[Typeserve Live API] Failed to start:', error);
  process.exit(1);
});
