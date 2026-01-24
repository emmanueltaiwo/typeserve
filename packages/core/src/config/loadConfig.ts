import { existsSync } from 'fs';
import { resolve } from 'path';
import { TypeServeConfig } from '../types';

let tsxRegistered = false;

function registerTsxIfNeeded(): void {
  if (tsxRegistered) return;
  try {
    const tsx = require('tsx');
    if (tsx.register) {
      tsx.register();
      tsxRegistered = true;
    }
  } catch {
    // tsx not available, will try direct require
  }
}

export function loadConfig(
  projectRoot: string = process.cwd(),
): TypeServeConfig {
  registerTsxIfNeeded();

  const configPath = resolve(projectRoot, 'typeserve.config.ts');

  if (!existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }

  try {
    const resolvedPath = require.resolve(configPath);
    delete require.cache[resolvedPath];
  } catch {
    // If require.resolve fails, tsx will handle it
  }

  const configModule = require(configPath);
  const config = configModule.default || configModule;

  if (!config || !config.routes || !Array.isArray(config.routes)) {
    throw new Error('Config must export a default object with a routes array');
  }

  return {
    port: config.port || 7002,
    basePath: config.basePath || '/api',
    routes: config.routes,
  };
}
