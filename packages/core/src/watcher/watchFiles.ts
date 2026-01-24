import chokidar from 'chokidar';
import type { FSWatcher } from 'chokidar';
import { TypeServeConfig } from '../types';
import { loadConfig } from '../config/loadConfig';
import { resetParser, getTypeFilePaths } from '../parser/parseTypes';
import { logger, formatDuration } from '../utils/logger';
import { getCurrentPort } from '../server/startServer';

let currentWatcher: FSWatcher | null = null;

export function watchFiles(
  projectRoot: string,
  onConfigChange: (config: TypeServeConfig) => Promise<void>,
): void {
  if (currentWatcher) {
    currentWatcher.close();
  }

  const configPath = `${projectRoot}/typeserve.config.ts`;

  let config: TypeServeConfig;
  try {
    config = loadConfig(projectRoot);
  } catch {
    config = { routes: [] };
  }

  const typeFilePaths = getTypeFilePaths(projectRoot, config);
  const watchPaths = [
    configPath,
    ...Array.from(typeFilePaths),
    `${projectRoot}/**/*.ts`,
    `${projectRoot}/**/*.tsx`,
  ];

  currentWatcher = chokidar.watch(watchPaths, {
    ignored: [
      /(^|[\/\\])\../,
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/.turbo/**',
    ],
    persistent: true,
  });

  let debounceTimer: NodeJS.Timeout;

  currentWatcher.on('change', (path: string) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const reloadStartTime = Date.now();
      try {
        const newConfig = loadConfig(projectRoot);
        const oldPort = getCurrentPort();
        const newPort = newConfig.port || 7002;

        if (oldPort !== null && oldPort !== newPort) {
          await onConfigChange(newConfig);
          return;
        }

        logger.info(`\n🔄 File changed: ${path}`);
        logger.info('🔄 Reloading server...');

        resetParser();

        let newTypeFilePaths: Set<string>;
        try {
          newTypeFilePaths = getTypeFilePaths(projectRoot, newConfig);
        } catch (error) {
          logger.warning(
            `⚠️  Warning: Failed to get type file paths: ${error instanceof Error ? error.message : String(error)}`,
          );
          newTypeFilePaths = new Set();
        }

        const pathsChanged = !arraysEqual(
          Array.from(typeFilePaths),
          Array.from(newTypeFilePaths),
        );
        if (pathsChanged) {
          watchFiles(projectRoot, onConfigChange);
        }

        await onConfigChange(newConfig);
        const reloadDuration = Date.now() - reloadStartTime;
        logger.success(
          `✅ Server reloaded in ${formatDuration(reloadDuration)}\n`,
        );
      } catch (error) {
        const reloadDuration = Date.now() - reloadStartTime;
        logger.error(
          `❌ Failed to reload after ${formatDuration(reloadDuration)}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }, 300);
  });

  currentWatcher.on('error', (error: unknown) => {
    logger.error(
      `Watcher error: ${error instanceof Error ? error.message : String(error)}`,
    );
  });
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  const setB = new Set(b);
  if (setA.size !== setB.size) return false;
  for (const item of setA) {
    if (!setB.has(item)) return false;
  }
  return true;
}
