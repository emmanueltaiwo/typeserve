import { RedisService } from './redis.service.js';
import { BullMQService } from './bullmq.service.js';
import {
  CreateServerRequest,
  ServerData,
  ActiveServer,
  CapacityErrorResponse,
} from '../types.js';
import { RouteConfig } from '@typeserve/core';
import {
  MAX_ACTIVE_SERVERS,
  MIN_EXPIRATION_SECONDS,
  MAX_EXPIRATION_SECONDS,
} from '../constants.js';

export class ServerService {
  constructor(
    private redisService: RedisService,
    private bullMQService: BullMQService
  ) {}

  async createServer(
    request: CreateServerRequest
  ): Promise<ServerData | CapacityErrorResponse> {
    const expiresAt = new Date(request.expiresAt);
    const now = new Date();
    const expirationSeconds = Math.floor(
      (expiresAt.getTime() - now.getTime()) / 1000
    );

    if (expirationSeconds < MIN_EXPIRATION_SECONDS) {
      throw new Error(
        `Expiration must be at least ${MIN_EXPIRATION_SECONDS / 60} minutes from now`
      );
    }

    if (expirationSeconds > MAX_EXPIRATION_SECONDS) {
      throw new Error(
        `Expiration must be at most ${MAX_EXPIRATION_SECONDS / 3600} hours from now`
      );
    }

    const added = await this.redisService.addActiveServer(request.name);
    if (!added) {
      throw new Error(
        `Server name "${request.name}" is already taken. Please choose a different name.`
      );
    }

    const activeCount = await this.redisService.getActiveServerCount();
    if (activeCount > MAX_ACTIVE_SERVERS) {
      await this.redisService.removeActiveServer(request.name);
      const nextAvailable = await this.getNextAvailableSlot();
      return {
        error: 'capacity_reached',
        nextAvailableInSeconds: nextAvailable,
      };
    }

    const routes: RouteConfig[] = request.routes.map((route) => ({
      method: route.method,
      path: route.path,
      type: route.responseType,
      count: route.responseType.endsWith('[]') ? 3 : undefined,
    }));

    const subdomain = `${request.name}.typeserve.live`;
    const serverData: ServerData = {
      name: request.name,
      subdomain,
      expiresAt: request.expiresAt,
      routes,
      types: request.types,
      createdAt: now.toISOString(),
    };

    try {
      await Promise.all([
        this.redisService.setServerData(request.name, serverData),
        this.redisService.setExpiration(request.name, request.expiresAt),
        this.redisService.setRoutes(request.name, JSON.stringify(routes)),
        this.redisService.setTypes(request.name, request.types),
      ]);

      try {
        await this.bullMQService.scheduleCleanup(
          request.name,
          request.expiresAt
        );
      } catch (scheduleError) {
        console.error(
          `[ServerService] Failed to schedule cleanup for ${request.name}:`,
          scheduleError
        );
      }
    } catch (error) {
      try {
        await this.redisService.removeActiveServer(request.name);
      } catch (rollbackError) {
        console.error(
          `[ServerService] Failed to rollback server creation for ${request.name}:`,
          rollbackError
        );
      }
      throw error;
    }

    console.log(
      `[ServerService] Created server: ${request.name}, expires at: ${request.expiresAt}`
    );

    // Pre-warm subdomain to cache Railway routing (non-blocking)
    this.warmupSubdomain(subdomain).catch((error) => {
      console.error(
        `[ServerService] Failed to warmup subdomain ${subdomain}:`,
        error
      );
      // Don't fail server creation if warmup fails
    });

    return serverData;
  }

  private async warmupSubdomain(subdomain: string): Promise<void> {
    const warmupUrl = `https://${subdomain}/__warmup`;
    try {
      const response = await fetch(warmupUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Typeserve-Live-Warmup/1.0',
        },
        signal: AbortSignal.timeout(5000),
      });
      console.log(
        `[ServerService] Warmup request to ${subdomain} completed with status ${response.status}`
      );
    } catch (error) {
      console.warn(
        `[ServerService] Warmup request to ${subdomain} failed:`,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  /**
   * Get all active servers
   */
  async getActiveServers(): Promise<ActiveServer[]> {
    const serverNames = await this.redisService.getActiveServerNames();
    const servers: ActiveServer[] = [];

    for (const name of serverNames) {
      const serverData = await this.redisService.getServerData(name);
      if (!serverData) continue;

      const expiresAt = new Date(serverData.expiresAt);
      const now = new Date();
      const expiresInSeconds = Math.max(
        0,
        Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
      );

      servers.push({
        name: serverData.name,
        subdomain: serverData.subdomain,
        expiresAt: serverData.expiresAt,
        createdAt: serverData.createdAt,
        expiresInSeconds,
      });
    }

    return servers.sort((a, b) => {
      const aTime = new Date(a.expiresAt).getTime();
      const bTime = new Date(b.expiresAt).getTime();
      return aTime - bTime;
    });
  }

  async getServer(name: string): Promise<ServerData | null> {
    return await this.redisService.getServerData(name);
  }

  /**
   * Get server by subdomain
   */
  async getServerBySubdomain(subdomain: string): Promise<ServerData | null> {
    // Extract name from subdomain (e.g., "my-api.typeserve.live" -> "my-api")
    const parts = subdomain.split('.');
    const name = parts[0];
    if (!name || name.length === 0) {
      return null;
    }
    return await this.getServer(name);
  }

  private async getNextAvailableSlot(): Promise<number> {
    const servers = await this.redisService.getServersByExpiration();
    if (servers.length === 0) {
      return 0;
    }

    const earliestExpiration = servers[0];
    if (!earliestExpiration) {
      return 0;
    }
    const now = Date.now();
    const expiresAt = earliestExpiration.expiresAt;
    const nextAvailable = Math.max(0, expiresAt - now);

    return Math.floor(nextAvailable / 1000);
  }

  async cleanupServer(name: string): Promise<void> {
    await this.bullMQService.cancelCleanup(name);
    await this.redisService.cleanupServer(name);
  }
}
