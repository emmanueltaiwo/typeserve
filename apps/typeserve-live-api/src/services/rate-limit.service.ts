import { Request, Response } from 'express';
import {
  rateLimit,
  RateLimitRequestHandler,
  ipKeyGenerator,
} from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { createClient } from 'redis';

const rateLimitRedisUrl =
  process.env.RATE_LIMIT_REDIS_URL ||
  process.env.REDIS_URL ||
  'redis://localhost:6379';

let redisClient: ReturnType<typeof createClient> | null = null;

async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({ url: rateLimitRedisUrl });
    redisClient.on('error', (err) =>
      console.error('[RateLimitService] Redis client error:', err)
    );
    await redisClient.connect();
  }
  return redisClient;
}

function getClientIp(req: Request): string {
  let ip: string;
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    const parts = forwarded.split(',');
    const firstIp = parts[0]?.trim();
    if (firstIp) {
      ip = firstIp;
    } else {
      ip = req.ip || req.socket?.remoteAddress || 'unknown';
    }
  } else {
    ip = req.ip || req.socket?.remoteAddress || 'unknown';
  }

  // Use ipKeyGenerator to properly handle IPv6 addresses
  return ipKeyGenerator(ip);
}

export async function checkSubdomainRateLimit(
  subdomain: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetAt?: number }> {
  try {
    const client = await getRedisClient();
    const key = `rate_limit:subdomain:${subdomain}`;
    const now = Date.now();
    const windowStart = Math.floor(now / windowMs) * windowMs;
    const windowKey = `${key}:${windowStart}`;

    const count = await client.incr(windowKey);
    if (count === 1) {
      await client.expire(windowKey, Math.ceil(windowMs / 1000));
    }

    const remaining = Math.max(0, limit - count);
    const resetAt = windowStart + windowMs;

    return {
      allowed: count <= limit,
      remaining,
      resetAt,
    };
  } catch (error) {
    console.error(
      '[RateLimitService] Error checking subdomain rate limit:',
      error
    );
    return {
      allowed: true,
      remaining: limit,
    };
  }
}

export function createRateLimitMiddleware(
  limit: number,
  windowMs: number,
  errorMessage?: string,
  keyGenerator?: (req: Request) => string
): RateLimitRequestHandler {
  return rateLimit({
    windowMs,
    max: limit,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: keyGenerator || getClientIp,
    store: new RedisStore({
      sendCommand: async (...args: string[]) => {
        const client = await getRedisClient();
        return client.sendCommand(args);
      },
    }),
    handler: (req: Request, res: Response) => {
      const requestId = (req as any).requestId || 'unknown';
      const identifier = (keyGenerator || getClientIp)(req);
      console.log(
        `[RateLimit] [${requestId}] Rate limit exceeded for ${identifier} on ${req.path}`
      );

      res.status(429).json({
        error: 'rate_limit_exceeded',
        message: errorMessage || 'Too many requests. Please try again later.',
      });
    },
  });
}

export const rateLimiters = {
  serverCreation: createRateLimitMiddleware(
    5,
    3600000,
    'Maximum 5 server creations per hour. Please try again later.'
  ),
  listServers: createRateLimitMiddleware(
    60,
    60000,
    'Too many requests. Please try again later.'
  ),
};
