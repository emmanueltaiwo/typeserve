import { existsSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import { TypeServeConfig } from '../types.js';

let tsxRegistered = false;

async function registerTsxIfNeeded(): Promise<void> {
  if (tsxRegistered) return;
  try {
    // @ts-expect-error - tsx doesn't have type definitions
    const tsx = await import('tsx');
    if (tsx.register) {
      tsx.register();
      tsxRegistered = true;
    }
  } catch {
    // tsx not available, will try direct import
  }
}

export async function loadConfig(
  projectRoot: string = process.cwd()
): Promise<TypeServeConfig> {
  await registerTsxIfNeeded();

  const configPath = resolve(projectRoot, 'typeserve.config.ts');

  if (!existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }

  // Use dynamic import for ESM
  // Convert path to file URL and add timestamp query to bust cache for hot reload
  const configUrl = pathToFileURL(configPath).href;
  const configModule = await import(configUrl + '?t=' + Date.now());
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
