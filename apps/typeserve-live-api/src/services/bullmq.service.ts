import { Queue, Worker, Job } from 'bullmq';
import { RedisService } from './redis.service';
import { BULLMQ_QUEUE_NAME } from '../constants';
import { cleanupServerCache } from '../handlers/subdomain.handler';

/**
 * BullMQ service for handling expiration jobs
 */
export class BullMQService {
  private queue: Queue;
  private worker: Worker;
  private redisService: RedisService;

  constructor(redisService: RedisService, redisUrl?: string) {
    // Parse connection options from URL or environment
    const url = redisUrl || process.env.REDIS_URL || 'redis://localhost:6379';
    const urlObj = new URL(url);

    const connection = {
      host: urlObj.hostname,
      port: parseInt(urlObj.port || '6379', 10),
      ...(urlObj.password && { password: urlObj.password }),
    };

    this.queue = new Queue(BULLMQ_QUEUE_NAME, {
      connection,
    });

    this.worker = new Worker(
      BULLMQ_QUEUE_NAME,
      async (job: Job) => {
        await this.handleExpiration(job.data.serverName);
      },
      {
        connection,
        limiter: {
          max: 10, // Process max 10 jobs per interval
          duration: 1000, // Per second
        },
        concurrency: 5, // Process up to 5 jobs concurrently
        removeOnComplete: {
          age: 3600, // Keep completed jobs for 1 hour
          count: 100, // Keep last 100 completed jobs
        },
        removeOnFail: {
          age: 24 * 3600, // Keep failed jobs for 24 hours
        },
      }
    );

    this.redisService = redisService;

    // Handle worker events
    this.worker.on('completed', (job) => {
      console.log(
        `[BullMQ] Cleanup job completed for server: ${job.data.serverName}`
      );
    });

    this.worker.on('failed', (job, err) => {
      console.error(
        `[BullMQ] Cleanup job failed for server: ${job?.data.serverName}`,
        err
      );
      // If job has exhausted all retries, log for manual intervention
      if (job && job.attemptsMade >= (job.opts?.attempts || 1)) {
        console.error(
          `[BullMQ] Cleanup job exhausted retries for server: ${job.data.serverName}. Manual cleanup may be required.`
        );
      }
    });

    this.worker.on('error', (err) => {
      console.error('[BullMQ] Worker error:', err);
    });
  }

  /**
   * Schedule a cleanup job for a server
   */
  async scheduleCleanup(serverName: string, expiresAt: string): Promise<void> {
    const expiresAtTime = new Date(expiresAt).getTime();
    const now = Date.now();
    const delay = expiresAtTime - now;

    if (delay <= 0) {
      // Already expired, cleanup immediately
      await this.handleExpiration(serverName);
      return;
    }

    await this.queue.add(
      `cleanup-${serverName}`,
      { serverName },
      {
        delay,
        jobId: `cleanup-${serverName}`, // Prevent duplicate jobs
      }
    );

    console.log(`[BullMQ] Scheduled cleanup for ${serverName} in ${delay}ms`);
  }

  /**
   * Cancel a cleanup job for a server
   */
  async cancelCleanup(serverName: string): Promise<void> {
    const job = await this.queue.getJob(`cleanup-${serverName}`);
    if (job) {
      await job.remove();
      console.log(`[BullMQ] Cancelled cleanup job for ${serverName}`);
    }
  }

  /**
   * Handle server expiration
   * Idempotent - safe to call multiple times
   */
  private async handleExpiration(serverName: string): Promise<void> {
    console.log(`[BullMQ] Handling expiration for server: ${serverName}`);

    try {
      // Verify server still exists and is expired
      const serverData = await this.redisService.getServerData(serverName);
      if (!serverData) {
        console.log(`[BullMQ] Server ${serverName} already cleaned up`);
        // Still try to clean up cache in case it wasn't cleaned
        cleanupServerCache(serverName);
        return;
      }

      const expiresAt = new Date(serverData.expiresAt).getTime();
      const now = Date.now();

      if (now < expiresAt) {
        console.log(
          `[BullMQ] Server ${serverName} not yet expired, skipping cleanup`
        );
        return;
      }

      // Perform cleanup atomically
      await this.redisService.cleanupServer(serverName);

      // Clean up server cache (temp files and parsed types)
      cleanupServerCache(serverName);

      console.log(`[BullMQ] Successfully cleaned up server: ${serverName}`);
    } catch (error) {
      console.error(`[BullMQ] Error cleaning up server ${serverName}:`, error);
      // Don't throw - let BullMQ handle retries
      // But log for monitoring
      throw error;
    }
  }

  /**
   * Close queue and worker gracefully
   */
  async close(): Promise<void> {
    try {
      // Wait for active jobs to complete (with timeout)
      await Promise.race([
        this.worker.close(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Worker close timeout')), 5000)
        ),
      ]);
    } catch (error) {
      console.error('[BullMQ] Error closing worker:', error);
    }

    try {
      await this.queue.close();
    } catch (error) {
      console.error('[BullMQ] Error closing queue:', error);
    }
  }
}
