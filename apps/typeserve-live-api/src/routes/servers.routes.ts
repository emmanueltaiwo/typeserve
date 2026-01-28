import { Router, Request, Response } from 'express';
import { ServerService } from '../services/server.service';
import { ValidationService } from '../services/validation.service';
import { rateLimiters } from '../services/rate-limit.service';
import {
  CreateServerRequest,
  ValidationErrorResponse,
  ServerData,
  CapacityErrorResponse,
  DuplicateSubdomainErrorResponse,
} from '../types';

function isCapacityError(
  result: ServerData | CapacityErrorResponse
): result is CapacityErrorResponse {
  return 'error' in result && result.error === 'capacity_reached';
}

/**
 * API routes for server management
 */
export function createServersRouter(serverService: ServerService): Router {
  const router = Router();

  router.post(
    '/',
    rateLimiters.serverCreation,
    async (req: Request, res: Response) => {
      try {
        const body = req.body as CreateServerRequest;

        // Validate required fields
        if (!body.name || !body.expiresAt || !body.routes || !body.types) {
          return res.status(400).json({
            error: 'validation_error',
            message: 'Missing required fields: name, expiresAt, routes, types',
          } as ValidationErrorResponse);
        }

        if (!/^[a-z0-9-]+$/.test(body.name)) {
          return res.status(400).json({
            error: 'validation_error',
            message:
              'Server name must contain only lowercase letters, numbers, and hyphens',
          } as ValidationErrorResponse);
        }

        // Validate expiration date
        const expiresAt = new Date(body.expiresAt);
        if (isNaN(expiresAt.getTime())) {
          return res.status(400).json({
            error: 'validation_error',
            message: 'Invalid expiresAt date format. Use ISO 8601 format.',
          } as ValidationErrorResponse);
        }

        if (!Array.isArray(body.routes) || body.routes.length === 0) {
          return res.status(400).json({
            error: 'validation_error',
            message: 'Routes must be a non-empty array',
          } as ValidationErrorResponse);
        }

        for (const route of body.routes) {
          if (!route.method || !route.path || !route.responseType) {
            return res.status(400).json({
              error: 'validation_error',
              message: 'Each route must have method, path, and responseType',
            } as ValidationErrorResponse);
          }

          if (!['GET', 'POST', 'PUT', 'DELETE'].includes(route.method)) {
            return res.status(400).json({
              error: 'validation_error',
              message: `Invalid method: ${route.method}. Must be GET, POST, PUT, or DELETE`,
            } as ValidationErrorResponse);
          }

          if (!route.path.startsWith('/')) {
            return res.status(400).json({
              error: 'validation_error',
              message: `Route path must start with '/': ${route.path}`,
            } as ValidationErrorResponse);
          }
        }

        // Comprehensive validation: TypeScript types, route types, and Express paths
        const validation = await ValidationService.validateServerRequest(body);
        if (!validation.valid) {
          return res.status(400).json({
            error: 'validation_error',
            message: validation.error || 'Validation failed',
          } as ValidationErrorResponse);
        }

        const result = await serverService.createServer(body);

        if (isCapacityError(result)) {
          return res.status(503).json(result);
        }

        // TypeScript now knows result is ServerData (not CapacityErrorResponse)
        // Return created server
        return res.status(201).json({
          name: result.name,
          subdomain: result.subdomain,
          expiresAt: result.expiresAt,
          createdAt: result.createdAt,
        });
      } catch (error) {
        const requestId = (req as any).requestId || 'unknown';
        console.error(`[POST /servers] [${requestId}] Error:`, error);

        const message =
          error instanceof Error ? error.message : 'Internal server error';

        if (error instanceof Error && message.includes('already taken')) {
          const requestBody = req.body as CreateServerRequest;
          return res.status(409).json({
            error: 'duplicate_subdomain',
            message,
            subdomain: `${requestBody.name || 'unknown'}.typeserve.live`,
            requestId,
          } as DuplicateSubdomainErrorResponse);
        }

        // Don't leak internal error details in production
        const isDevelopment = process.env.NODE_ENV !== 'production';
        const errorMessage = isDevelopment
          ? message
          : 'Validation failed. Please check your input.';

        return res.status(400).json({
          error: 'validation_error',
          message: errorMessage,
          requestId,
        } as ValidationErrorResponse);
      }
    }
  );

  router.get(
    '/',
    rateLimiters.listServers,
    async (req: Request, res: Response) => {
      try {
        const servers = await serverService.getActiveServers();
        return res.json(servers);
      } catch (error) {
        const requestId = (req as any).requestId || 'unknown';
        console.error(`[GET /servers] [${requestId}] Error:`, error);
        return res.status(500).json({
          error: 'internal_error',
          message: 'Failed to retrieve servers',
          requestId,
        });
      }
    }
  );

  return router;
}
