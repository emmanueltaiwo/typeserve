import { existsSync } from 'fs';
import { resolve } from 'path';
import { TypeServeConfig } from '../types';

// Get require function - CLI uses CJS build where require is available
// This function works in both CJS and ESM builds
function getRequire(): NodeRequire {
  // CLI uses CJS build, so require is always available
  if (typeof require !== 'undefined') {
    return require;
  }
  // ESM context fallback (should not be reached when CLI uses CJS build)
  // tsup should handle require() conversion, but this is a safety fallback
  throw new Error(
    'loadConfig requires CommonJS context. The CLI uses the CJS build where require is available.'
  );
}

let tsxRegistered = false;

function registerTsxIfNeeded(): void {
  if (tsxRegistered) return;
  try {
    const requireFn = getRequire();
    const tsx = requireFn('tsx');
    if (tsx.register) {
      tsx.register();
      tsxRegistered = true;
    }
  } catch {
    // tsx not available, will try direct require
  }
}

export function loadConfig(
  projectRoot: string = process.cwd()
): TypeServeConfig {
  registerTsxIfNeeded();

  const configPath = resolve(projectRoot, 'typeserve.config.ts');

  if (!existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }

  // Clear cache if in CJS mode (require.cache exists)
  // This works in CJS build, skipped in ESM build
  if (typeof require !== 'undefined' && require.cache) {
    try {
      const resolvedPath = require.resolve(configPath);
      delete require.cache[resolvedPath];
    } catch {
      // If require.resolve fails, tsx will handle it
    }
  }

  const requireFn = getRequire();
  const configModule = requireFn(configPath);
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
