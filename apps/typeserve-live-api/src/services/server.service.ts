import { RedisService } from './redis.service';
import { BullMQService } from './bullmq.service';
import {
  CreateServerRequest,
  ServerData,
  ActiveServer,
  CapacityErrorResponse,
} from '../types';
import { RouteConfig } from '@typeserve/core';
import {
  MAX_ACTIVE_SERVERS,
  MIN_EXPIRATION_SECONDS,
  MAX_EXPIRATION_SECONDS,
} from '../constants';

/**
 * Server management service
 */
export class ServerService {
  constructor(
    private redisService: RedisService,
    private bullMQService: BullMQService
  ) {}

  /**
   * Create a new mock server
   */
  async createServer(
    request: CreateServerRequest
  ): Promise<ServerData | CapacityErrorResponse> {
    // Validate expiration
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

    // Atomic check-and-create pattern to prevent race conditions
    // Try to add to active servers set first (atomic operation)
    const added = await this.redisService.addActiveServer(request.name);
    if (!added) {
      // Server name already exists - rollback and return error
      throw new Error(
        `Server name "${request.name}" is already taken. Please choose a different name.`
      );
    }

    // Check capacity AFTER atomic add (to prevent race condition)
    // If over capacity, we'll clean up and return error
    const activeCount = await this.redisService.getActiveServerCount();
    if (activeCount > MAX_ACTIVE_SERVERS) {
      // Rollback: remove from active servers
      await this.redisService.removeActiveServer(request.name);
      const nextAvailable = await this.getNextAvailableSlot();
      return {
        error: 'capacity_reached',
        nextAvailableInSeconds: nextAvailable,
      };
    }

    // Convert routes to RouteConfig format
    const routes: RouteConfig[] = request.routes.map((route) => ({
      method: route.method,
      path: route.path,
      type: route.responseType,
      count: route.responseType.endsWith('[]') ? 3 : undefined, // Default array count
    }));

    // Create server data
    const subdomain = `${request.name}.typeserve.live`;
    const serverData: ServerData = {
      name: request.name,
      subdomain,
      expiresAt: request.expiresAt,
      routes,
      types: request.types,
      createdAt: now.toISOString(),
    };

    // Store in Redis (server already added to active set atomically above)
    // Use try-catch to rollback on failure
    try {
      await Promise.all([
        this.redisService.setServerData(request.name, serverData),
        this.redisService.setExpiration(request.name, request.expiresAt),
        this.redisService.setRoutes(request.name, JSON.stringify(routes)),
        this.redisService.setTypes(request.name, request.types),
      ]);

      // Schedule cleanup job (don't fail if scheduling fails - server is already created)
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
        // Continue - server is created, cleanup can be handled manually if needed
      }
    } catch (error) {
      // Rollback: remove from active servers if storage fails
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

    return serverData;
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

  /**
   * Get server by name
   */
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

  /**
   * Calculate when the next server slot becomes available
   */
  private async getNextAvailableSlot(): Promise<number> {
    const servers = await this.redisService.getServersByExpiration();
    if (servers.length === 0) {
      return 0;
    }

    // Get the earliest expiration (guaranteed to exist after length check)
    const earliestExpiration = servers[0];
    if (!earliestExpiration) {
      return 0;
    }
    const now = Date.now();
    const expiresAt = earliestExpiration.expiresAt;
    const nextAvailable = Math.max(0, expiresAt - now);

    return Math.floor(nextAvailable / 1000); // Convert to seconds
  }

  /**
   * Cleanup a server (manual cleanup if needed)
   */
  async cleanupServer(name: string): Promise<void> {
    await this.bullMQService.cancelCleanup(name);
    await this.redisService.cleanupServer(name);
  }
}
