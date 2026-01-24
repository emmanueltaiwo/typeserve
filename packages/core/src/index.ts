import { TypeServeConfig, RouteConfig } from './types';

export function defineMock(config: TypeServeConfig): TypeServeConfig {
  return config;
}

export function createRoute(route: RouteConfig): RouteConfig {
  if (route.count !== undefined && (route.count < 1 || route.count > 5)) {
    throw new Error('Route count must be between 1 and 5');
  }
  return route;
}

export * from './types';
export * from './config/loadConfig';
export * from './parser/parseTypes';
export * from './generator/generateData';
export * from './server/startServer';
export * from './watcher/watchFiles';
