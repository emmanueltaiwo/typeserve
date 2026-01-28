import { createClient } from 'limitly-sdk';
import { Request, Response, NextFunction } from 'express';

const limitlyRedisUrl =
  process.env.LIMITLY_REDIS_URL ||
  process.env.REDIS_URL ||
  'redis://localhost:6379';

const limitlyClient = createClient({
  redisUrl: limitlyRedisUrl,
  serviceId: 'typeserve-live-api',
  algorithm: 'sliding-window',
});

function getClientIdentifier(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    const parts = forwarded.split(',');
    const firstIp = parts[0];
    if (firstIp) {
      return firstIp.trim();
    }
  }
  if (req.ip) {
    return req.ip;
  }
  if (req.socket?.remoteAddress) {
    return req.socket.remoteAddress;
  }
  return 'unknown';
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt?: number;
}

export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSizeMs: number
): Promise<RateLimitResult> {
  try {
    const result = await limitlyClient.checkRateLimit({
      identifier,
      limit,
      windowSize: windowSizeMs,
      algorithm: 'sliding-window',
    });

    return {
      allowed: result.allowed,
      remaining: result.remaining ?? limit,
      resetAt: (result as any).resetAt ?? (result as any).reset,
    };
  } catch (error) {
    console.error('[RateLimitService] Error checking rate limit:', error);
    return {
      allowed: true,
      remaining: limit,
    };
  }
}

export function createRateLimitMiddleware(
  limit: number,
  windowSizeMs: number,
  errorMessage?: string
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const identifier = getClientIdentifier(req);
    const result = await checkRateLimit(identifier, limit, windowSizeMs);

    if (!result.allowed) {
      const requestId = (req as any).requestId || 'unknown';
      console.log(
        `[RateLimit] [${requestId}] Rate limit exceeded for ${identifier} on ${req.path}`
      );

      res.setHeader('X-RateLimit-Limit', limit.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      if (result.resetAt) {
        res.setHeader('X-RateLimit-Reset', result.resetAt.toString());
      }

      return res.status(429).json({
        error: 'rate_limit_exceeded',
        message: errorMessage || 'Too many requests. Please try again later.',
        retryAfter: result.resetAt
          ? Math.ceil((result.resetAt - Date.now()) / 1000)
          : undefined,
      });
    }

    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
    if (result.resetAt) {
      res.setHeader('X-RateLimit-Reset', result.resetAt.toString());
    }

    next();
  };
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
  subdomainAPI: (subdomain: string) =>
    createRateLimitMiddleware(
      1000,
      60000,
      `Rate limit exceeded for ${subdomain}. Maximum 1000 requests per minute.`
    ),
};
