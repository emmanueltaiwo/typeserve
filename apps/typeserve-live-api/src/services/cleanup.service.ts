import { RedisService } from './redis.service.js';
import { cleanupServerCache } from '../handlers/subdomain.handler.js';

export class CleanupService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(private redisService: RedisService) {}

  /**
   * Start periodic cleanup
   */
  start(intervalMs: number = 5 * 60 * 1000): void {
    if (this.isRunning) {
      console.log('[CleanupService] Already running');
      return;
    }

    this.isRunning = true;
    console.log(
      `[CleanupService] Starting periodic cleanup (every ${intervalMs / 1000}s)`
    );

    this.cleanupExpiredServers().catch((error) => {
      console.error('[CleanupService] Error in initial cleanup:', error);
    });

    this.intervalId = setInterval(() => {
      this.cleanupExpiredServers().catch((error) => {
        console.error('[CleanupService] Error in periodic cleanup:', error);
      });
    }, intervalMs);
  }

  /**
   * Stop periodic cleanup
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('[CleanupService] Stopped periodic cleanup');
  }

  private async cleanupExpiredServers(): Promise<void> {
    try {
      const serverNames = await this.redisService.getActiveServerNames();
      const now = Date.now();
      let cleanedCount = 0;

      for (const name of serverNames) {
        const expiresAt = await this.redisService.getExpiration(name);
        if (expiresAt && now >= expiresAt) {
          try {
            await this.redisService.cleanupServer(name);
            cleanupServerCache(name);
            cleanedCount++;
            console.log(`[CleanupService] Cleaned up expired server: ${name}`);
          } catch (error) {
            console.error(
              `[CleanupService] Error cleaning up server ${name}:`,
              error
            );
          }
        }
      }

      if (cleanedCount > 0) {
        console.log(
          `[CleanupService] Cleaned up ${cleanedCount} expired server(s)`
        );
      }
    } catch (error) {
      console.error('[CleanupService] Error in cleanup process:', error);
    }
  }
}
