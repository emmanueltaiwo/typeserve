import express, { Express, Request, Response } from 'express';
import { TypeServeConfig, RouteConfig } from '../types';
import { parseTypes } from '../parser/parseTypes';
import { generateData } from '../generator/generateData';
import { createServer, Server } from 'http';
import { logger, formatDuration } from '../utils/logger';

let app: Express | null = null;
let server: Server | null = null;
let currentPort: number | null = null;
const routeTypeCache = new Map<string, any>();

function detectAndFilterDuplicates(routes: RouteConfig[]): RouteConfig[] {
  const seen = new Map<string, { route: RouteConfig; firstIndex: number }>();
  const duplicates: Array<{ route: RouteConfig; index: number }> = [];

  routes.forEach((route, index) => {
    const key = `${route.method}:${route.path}`;
    if (seen.has(key)) {
      duplicates.push({ route, index });
    } else {
      seen.set(key, { route, firstIndex: index });
    }
  });

  if (duplicates.length > 0) {
    logger.warning(`⚠️  Found ${duplicates.length} duplicate route(s):`);
    duplicates.forEach(({ route, index }) => {
      const key = `${route.method}:${route.path}`;
      const first = seen.get(key)!;
      logger.warning(
        `   Duplicate at index ${index + 1}: ${route.method} ${route.path} → ${route.type}`,
      );
      logger.dim(
        `   First occurrence at index ${first.firstIndex + 1} (will be used): ${first.route.method} ${first.route.path} → ${first.route.type}`,
      );
    });
    logger.dim('   Only the first occurrence of each route will be used.\n');
  }

  return Array.from(seen.values()).map((item) => item.route);
}

function requestLogger(req: Request, res: Response, next: () => void): void {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const method = req.method;
    const path = req.originalUrl || req.path;
    const statusCode = res.statusCode;
    logger.request(method, path, statusCode, duration);
  });

  next();
}

const failedRoutes = new Set<string>();

function preParseTypes(
  routes: RouteConfig[],
  projectRoot: string,
  isReload: boolean = false,
): void {
  const parseStartTime = Date.now();
  if (!isReload) {
    logger.info('📖 Parsing types...');
    const routeCount = routes.length;
    const estimatedMs = routeCount * 2000 + 5000;
    const estimatedTime = formatDuration(estimatedMs);
    logger.dim(
      `   This may take a while depending on the number of types and project size (est ${estimatedTime}).`,
    );
  } else {
    logger.info('📖 Parsing types...');
  }

  routeTypeCache.clear();
  failedRoutes.clear();

  for (const route of routes) {
    const cacheKey = `${route.method}:${route.path}:${route.type}:${route.file || ''}`;
    try {
      const parsedType = parseTypes(projectRoot, route.type, route.file);
      routeTypeCache.set(cacheKey, parsedType);
    } catch (error) {
      const routeKey = `${route.method}:${route.path}`;
      failedRoutes.add(routeKey);
      logger.warning(
        `⚠️  Warning: Failed to parse type "${route.type}" for route ${route.path}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  const parseDuration = Date.now() - parseStartTime;
  logger.success(`✅ Types parsed in ${formatDuration(parseDuration)}`);
}

export function startServer(
  config: TypeServeConfig,
  projectRoot: string,
  isReload: boolean = false,
): void {
  const serverStartTime = Date.now();

  if (server) {
    server.close();
  }

  app = express();
  app.use(requestLogger);
  app.use(express.json());

  const filteredRoutes = detectAndFilterDuplicates(config.routes);
  preParseTypes(filteredRoutes, projectRoot, isReload);

  const basePath = config.basePath || '/api';

  for (const route of filteredRoutes) {
    const routeKey = `${route.method}:${route.path}`;
    if (failedRoutes.has(routeKey)) {
      continue;
    }

    const fullPath = `${basePath}${route.path}`;
    const cacheKey = `${route.method}:${route.path}:${route.type}:${route.file || ''}`;
    const parsedType = routeTypeCache.get(cacheKey);

    if (!parsedType) {
      failedRoutes.add(routeKey);
      continue;
    }

    const handler = (req: Request, res: Response) => {
      try {
        const data = generateData(parsedType, route.count, routeTypeCache);
        res.json(data);
      } catch (error) {
        res.status(500).json({
          error: 'Failed to generate mock data',
          message: error instanceof Error ? error.message : String(error),
        });
      }
    };

    if (route.method === 'GET') {
      app.get(fullPath, handler);
    } else if (route.method === 'POST') {
      app.post(fullPath, handler);
    } else if (route.method === 'PUT') {
      app.put(fullPath, handler);
    } else if (route.method === 'DELETE') {
      app.delete(fullPath, handler);
    }
  }

  const desiredPort = config.port || 7002;
  tryStartServer(desiredPort, basePath, filteredRoutes, serverStartTime, undefined);
}

function tryStartServer(
  port: number,
  basePath: string,
  routes: RouteConfig[],
  startTime: number | null,
  originalPort?: number,
): void {
  const targetPort = port;
  const isRetry = originalPort !== undefined;

  if (isRetry) {
    logger.warning(
      `⚠️  Port ${originalPort} is already in use. Attempting to start on port ${targetPort}...`,
    );
  } else {
    logger.info(`🚀 Attempting to start your server on port ${targetPort}...`);
  }

  if (!app) {
    throw new Error('Express app not initialized');
  }

  server = createServer(app);

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      const nextPort = targetPort + 1;
      if (nextPort > 65535) {
        console.error(
          '❌ No available ports found. Please free up a port and try again.',
        );
        return;
      }
      server = null;
      tryStartServer(
        nextPort,
        basePath,
        routes,
        startTime,
        originalPort || targetPort,
      );
    } else {
      console.error('❌ Server error:', error.message);
    }
  });

  server.listen(targetPort, () => {
    const finalPort = targetPort;
    currentPort = finalPort;

    const duration = startTime ? Date.now() - startTime : 0;
    logger.success(
      `✅ TypeServe running on http://localhost:${finalPort}${basePath} (started in ${formatDuration(duration)})`,
    );
    if (isRetry) {
      logger.dim(`   (Originally attempted port ${originalPort})`);
    }
    logger.info(`📋 Available routes:`);
    routes.forEach((route) => {
      const routeKey = `${route.method}:${route.path}`;
      if (failedRoutes.has(routeKey)) {
        return;
      }
      let methodColor = '\x1b[34m';
      if (route.method === 'GET') {
        methodColor = '\x1b[34m';
      } else if (route.method === 'POST') {
        methodColor = '\x1b[35m';
      } else if (route.method === 'PUT') {
        methodColor = '\x1b[33m';
      } else if (route.method === 'DELETE') {
        methodColor = '\x1b[31m';
      }
      const methodStr = `${methodColor}${route.method}\x1b[0m`;
      logger.dim(`   ${methodStr} ${basePath}${route.path} → ${route.type}`);
    });
  });
}

export function getCurrentPort(): number | null {
  return currentPort;
}

export function stopServer(silent: boolean = false): void {
  if (server) {
    if (!silent) {
      logger.info('\n🛑 Stopping TypeServe server...');
    }
    server.close(() => {
      if (!silent) {
        logger.success('✅ Server stopped successfully');
      }
    });
    server = null;
    app = null;
    currentPort = null;
    routeTypeCache.clear();
  }
}
