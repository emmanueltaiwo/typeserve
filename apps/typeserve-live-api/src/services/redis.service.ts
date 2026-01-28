import { createClient, RedisClientType } from 'redis';
import { ServerData } from '../types.js';
import { REDIS_KEYS } from '../constants.js';

export class RedisService {
  private client: RedisClientType;

  constructor(redisUrl?: string) {
    const url = redisUrl || process.env.REDIS_URL || 'redis://localhost:6379';
    this.client = createClient({ url });
    this.client.on('error', (err) =>
      console.error('[RedisService] Redis client error:', err)
    );
  }

  /**
   * Ensure Redis connection is established with retry logic
   */
  private async ensureConnected(): Promise<void> {
    if (!this.client.isOpen) {
      try {
        await this.client.connect();
      } catch (error) {
        console.error('[RedisService] Failed to connect:', error);
        throw new Error('Redis connection failed');
      }
    }
  }

  async getActiveServerNames(): Promise<string[]> {
    await this.ensureConnected();
    const members = await this.client.sMembers(REDIS_KEYS.ACTIVE_SERVERS);
    return members;
  }

  /**
   * Get active server count
   */
  async getActiveServerCount(): Promise<number> {
    await this.ensureConnected();
    return await this.client.sCard(REDIS_KEYS.ACTIVE_SERVERS);
  }

  async addActiveServer(name: string): Promise<boolean> {
    await this.ensureConnected();
    const added = await this.client.sAdd(REDIS_KEYS.ACTIVE_SERVERS, name);
    return added === 1;
  }

  async removeActiveServer(name: string): Promise<void> {
    await this.ensureConnected();
    await this.client.sRem(REDIS_KEYS.ACTIVE_SERVERS, name);
  }

  async setServerData(name: string, data: ServerData): Promise<void> {
    await this.ensureConnected();
    const key = `${REDIS_KEYS.SERVER_PREFIX}${name}`;
    await this.client.set(key, JSON.stringify(data));
  }

  /**
   * Get server data
   */
  async getServerData(name: string): Promise<ServerData | null> {
    await this.ensureConnected();
    const key = `${REDIS_KEYS.SERVER_PREFIX}${name}`;
    const data = await this.client.get(key);
    if (!data) return null;
    return JSON.parse(data) as ServerData;
  }

  async deleteServerData(name: string): Promise<void> {
    await this.ensureConnected();
    const key = `${REDIS_KEYS.SERVER_PREFIX}${name}`;
    await this.client.del(key);
  }

  /**
   * Set expiration timestamp
   */
  async setExpiration(name: string, expiresAt: string): Promise<void> {
    await this.ensureConnected();
    const key = `${REDIS_KEYS.EXPIRATION_PREFIX}${name}`;
    const timestamp = new Date(expiresAt).getTime();
    await this.client.set(key, timestamp.toString());
  }

  async getExpiration(name: string): Promise<number | null> {
    await this.ensureConnected();
    const key = `${REDIS_KEYS.EXPIRATION_PREFIX}${name}`;
    const value = await this.client.get(key);
    return value ? parseInt(value, 10) : null;
  }

  async deleteExpiration(name: string): Promise<void> {
    await this.ensureConnected();
    const key = `${REDIS_KEYS.EXPIRATION_PREFIX}${name}`;
    await this.client.del(key);
  }

  async setRoutes(name: string, routes: string): Promise<void> {
    await this.ensureConnected();
    const key = `${REDIS_KEYS.ROUTES_PREFIX}${name}`;
    await this.client.set(key, routes);
  }

  async getRoutes(name: string): Promise<string | null> {
    await this.ensureConnected();
    const key = `${REDIS_KEYS.ROUTES_PREFIX}${name}`;
    return await this.client.get(key);
  }

  /**
   * Delete routes
   */
  async deleteRoutes(name: string): Promise<void> {
    await this.ensureConnected();
    const key = `${REDIS_KEYS.ROUTES_PREFIX}${name}`;
    await this.client.del(key);
  }

  async setTypes(name: string, types: string): Promise<void> {
    await this.ensureConnected();
    const key = `${REDIS_KEYS.TYPES_PREFIX}${name}`;
    await this.client.set(key, types);
  }

  /**
   * Get types for a server
   */
  async getTypes(name: string): Promise<string | null> {
    await this.ensureConnected();
    const key = `${REDIS_KEYS.TYPES_PREFIX}${name}`;
    return await this.client.get(key);
  }

  async deleteTypes(name: string): Promise<void> {
    await this.ensureConnected();
    const key = `${REDIS_KEYS.TYPES_PREFIX}${name}`;
    await this.client.del(key);
  }

  /**
   * Get all server names sorted by expiration time (earliest first)
   */
  async getServersByExpiration(): Promise<
    Array<{ name: string; expiresAt: number }>
  > {
    const serverNames = await this.getActiveServerNames();
    const servers: Array<{ name: string; expiresAt: number }> = [];

    for (const name of serverNames) {
      const expiresAt = await this.getExpiration(name);
      if (expiresAt) {
        servers.push({ name, expiresAt });
      }
    }

    return servers.sort((a, b) => a.expiresAt - b.expiresAt);
  }

  async cleanupServer(name: string): Promise<void> {
    await this.ensureConnected();
    const pipeline = this.client.multi();

    pipeline.sRem(REDIS_KEYS.ACTIVE_SERVERS, name);
    pipeline.del(`${REDIS_KEYS.SERVER_PREFIX}${name}`);
    pipeline.del(`${REDIS_KEYS.EXPIRATION_PREFIX}${name}`);
    pipeline.del(`${REDIS_KEYS.ROUTES_PREFIX}${name}`);
    pipeline.del(`${REDIS_KEYS.TYPES_PREFIX}${name}`);

    await pipeline.exec();
  }

  async close(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.quit();
    }
  }
}
