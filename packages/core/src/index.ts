import { TypeServeConfig, RouteConfig } from './types.js';

export function defineMock(config: TypeServeConfig): TypeServeConfig {
  return config;
}

export function createRoute(route: RouteConfig): RouteConfig {
  if (route.count !== undefined && (route.count < 1 || route.count > 5)) {
    throw new Error('Route count must be between 1 and 5');
  }
  return route;
}

export * from './types.js';
export * from './config/loadConfig.js';
export * from './parser/parseTypes.js';
export * from './generator/generateData.js';
export * from './server/startServer.js';
export * from './watcher/watchFiles.js';
