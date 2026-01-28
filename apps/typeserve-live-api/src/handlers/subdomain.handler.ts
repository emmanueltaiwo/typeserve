import { Request, Response, NextFunction } from 'express';
import { ServerService } from '../services/server.service.js';
import { parseTypes, generateData, ParsedType } from '@typeserve/core';
import { RouteConfig } from '@typeserve/core';
import { tmpdir } from 'os';
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join } from 'path';
import { checkSubdomainRateLimit } from '../services/rate-limit.service.js';

const parsedTypesCache = new Map<string, Map<string, ParsedType>>();
const MAX_CACHE_SIZE = 100;

function pathPatternToRegex(pathPattern: string): RegExp {
  const segments = pathPattern.split('/').filter((s) => s.length > 0);
  const regexParts = segments.map((seg) => {
    if (seg.startsWith(':')) {
      return '[^/]+';
    }
    return seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  });
  const pattern = '^/' + regexParts.join('/') + '$';
  return new RegExp(pattern);
}

/**
 * Normalize path for matching (strip trailing slash, keep "/" as-is)
 */
function normalizePath(path: string): string {
  const trimmed = path.replace(/\/$/, '');
  return trimmed === '' ? '/' : trimmed;
}

function pathMatches(pattern: string, path: string): boolean {
  const normalized = normalizePath(path);
  if (pattern === normalized) return true;
  const re = pathPatternToRegex(pattern);
  return re.test(normalized);
}

/**
 * Clean up oldest cache entries if cache exceeds limit
 */
function cleanupOldCacheEntries(): void {
  if (parsedTypesCache.size > MAX_CACHE_SIZE) {
    // Remove oldest entries (simple FIFO - remove first entry)
    const firstKey = parsedTypesCache.keys().next().value;
    if (firstKey) {
      parsedTypesCache.delete(firstKey);
      // Also clean up temp directory
      const tempDir = join(tmpdir(), 'typeserve-live', firstKey);
      if (existsSync(tempDir)) {
        try {
          rmSync(tempDir, { recursive: true, force: true });
        } catch (error) {
          // Ignored
        }
      }
    }
  }
}

export function createSubdomainHandler(serverService: ServerService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hostname = req.hostname || req.get('host') || '';
      const subdomain = hostname.split('.')[0];

      if (
        !hostname.includes('.typeserve.live') ||
        !subdomain ||
        subdomain === 'api' ||
        subdomain === 'www'
      ) {
        return next();
      }

      // TypeScript now knows subdomain is a non-empty string after the check above
      const validSubdomain: string = subdomain;

      // Get server data
      const serverData =
        await serverService.getServerBySubdomain(validSubdomain);
      if (!serverData) {
        return res.status(404).json({
          error: 'server_not_found',
          message: `Server "${validSubdomain}" not found or expired`,
        });
      }

      const expiresAt = new Date(serverData.expiresAt);
      const now = new Date();
      if (now >= expiresAt) {
        return res.status(410).json({
          error: 'server_expired',
          message: `Server "${validSubdomain}" has expired`,
        });
      }

      // Handle warmup endpoint (no rate limiting)
      if (req.path === '/__warmup') {
        return res.json({
          status: 'ok',
          message: 'Server is ready',
          subdomain: validSubdomain,
        });
      }

      // Rate limit subdomain API requests (1000 per minute per subdomain)
      const rateLimitResult = await checkSubdomainRateLimit(
        validSubdomain,
        1000,
        60000
      );

      if (!rateLimitResult.allowed) {
        res.setHeader('X-RateLimit-Limit', '1000');
        res.setHeader('X-RateLimit-Remaining', '0');
        if (rateLimitResult.resetAt) {
          res.setHeader(
            'X-RateLimit-Reset',
            rateLimitResult.resetAt.toString()
          );
        }
        return res.status(429).json({
          error: 'rate_limit_exceeded',
          message: `Rate limit exceeded for ${validSubdomain}. Maximum 1000 requests per minute.`,
          retryAfter: rateLimitResult.resetAt
            ? Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)
            : undefined,
        });
      }

      res.setHeader('X-RateLimit-Limit', '1000');
      res.setHeader(
        'X-RateLimit-Remaining',
        rateLimitResult.remaining.toString()
      );
      if (rateLimitResult.resetAt) {
        res.setHeader('X-RateLimit-Reset', rateLimitResult.resetAt.toString());
      }

      // Normalize path so /route/123/ matches /route/:id
      const requestPath = normalizePath(req.path);
      // Find matching route (exact path first, then param paths e.g. /route/:id)
      const route =
        serverData.routes.find(
          (r) => r.path === requestPath && r.method === req.method
        ) ??
        serverData.routes.find(
          (r) => pathMatches(r.path, requestPath) && r.method === req.method
        );

      if (!route) {
        return res.status(404).json({
          error: 'route_not_found',
          message: `Route ${req.method} ${req.path} not found`,
        });
      }

      const mockData = await generateMockData(
        serverData,
        route,
        validSubdomain
      );

      return res.json(mockData);
    } catch (error) {
      console.error('[SubdomainHandler] Error:', error);
      return res.status(500).json({
        error: 'internal_error',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to generate mock data',
      });
    }
  };
}

/**
 * Generate mock data for a route using Typeserve core
 */
async function generateMockData(
  serverData: { name: string; types: string; routes: RouteConfig[] },
  route: RouteConfig,
  serverName: string
): Promise<any> {
  const tempDir = join(tmpdir(), 'typeserve-live', serverName);
  const typesFile = join(tempDir, 'types.ts');

  // Ensure temp directory exists
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true });
  }

  // Write types to temporary file
  writeFileSync(typesFile, serverData.types, 'utf-8');

  try {
    // Get or create cache for this server
    let serverCache = parsedTypesCache.get(serverName);
    if (!serverCache) {
      // Clean up old cache entries before adding new one
      cleanupOldCacheEntries();
      serverCache = new Map();
      parsedTypesCache.set(serverName, serverCache);
    }

    // Check cache first
    const cacheKey = route.type;
    let parsedType = serverCache.get(cacheKey);

    if (!parsedType) {
      // Parse the type using Typeserve core
      parsedType = parseTypes(tempDir, route.type, 'types.ts');
      serverCache.set(cacheKey, parsedType);
    }

    // Generate mock data
    const mockData = generateData(parsedType, route.count, serverCache);

    return mockData;
  } catch (error) {
    console.error(
      `[generateMockData] Error for server ${serverName}, route ${route.path}:`,
      error
    );
    throw error;
  }
}

export function cleanupServerCache(serverName: string): void {
  parsedTypesCache.delete(serverName);
  const tempDir = join(tmpdir(), 'typeserve-live', serverName);
  if (existsSync(tempDir)) {
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.error(
        `[cleanupServerCache] Error cleaning up temp dir for ${serverName}:`,
        error
      );
    }
  }
}
