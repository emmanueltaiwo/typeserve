#!/usr/bin/env node

import { Command } from 'commander';
import {
  loadConfig,
  startServer,
  watchFiles,
  stopServer,
  getCurrentPort,
} from '@typeserve/core';
import { existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { createInterface } from 'readline';

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
};

function colorize(text: string, color: string): string {
  return `${color}${text}${colors.reset}`;
}

const program = new Command();

program
  .name('typeserve')
  .description('Generate live mock APIs from TypeScript types')
  .version('1.0.0');

function promptUser(question: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

program
  .command('init')
  .description('Initialize a new typeserve.config.ts file')
  .action(async () => {
    const projectRoot = process.cwd();
    const configPath = resolve(projectRoot, 'typeserve.config.ts');

    if (existsSync(configPath)) {
      const answer = await promptUser(
        colorize(
          '⚠️  typeserve.config.ts already exists. Do you want to override? (y/n): ',
          colors.yellow
        )
      );

      if (answer !== 'y' && answer !== 'yes') {
        console.log(colorize('❌ Operation cancelled.', colors.red));
        process.exit(0);
      }
    }

    const configTemplate = `import { defineMock } from '@typeserve/core';

export default defineMock({
  port: 7002,
  basePath: '/api',
  routes: [],
});
`;

    try {
      writeFileSync(configPath, configTemplate, 'utf-8');
      console.log(
        colorize('✅ Created typeserve.config.ts successfully!', colors.green)
      );
      console.log(
        colorize('📝 Edit the file to add your routes and types.', colors.cyan)
      );
    } catch (error) {
      console.error(
        colorize(
          `❌ Failed to create config file: ${error instanceof Error ? error.message : String(error)}`,
          colors.red
        )
      );
      process.exit(1);
    }
  });

program
  .command('dev')
  .description('Start the development server with hot reload')
  .option('-p, --port <port>', 'Port number', '7002')
  .option('-c, --config <path>', 'Config file path', 'typeserve.config.ts')
  .action(async (options) => {
    const projectRoot = process.cwd();
    const port = parseInt(options.port, 10);

    try {
      console.log(colorize('📖 Loading configuration...', colors.cyan));
      let config = await loadConfig(projectRoot);
      if (port !== 7002) {
        config = { ...config, port };
      }

      console.log(
        colorize('✅ Configuration loaded successfully', colors.green)
      );
      startServer(config, projectRoot);

      await watchFiles(projectRoot, async (newConfig) => {
        const oldPort = getCurrentPort();
        const newPort = newConfig.port || 7002;

        if (oldPort !== null && oldPort !== newPort) {
          console.log(
            colorize(
              `\n⚠️  Port changed from ${oldPort} to ${newPort}`,
              colors.yellow
            )
          );
          console.log(colorize('🛑 Server is closing...', colors.yellow));
          stopServer(true);
          console.log(
            colorize(
              'ℹ️  Restart the server to continue with the new port.\n',
              colors.cyan
            )
          );
          setTimeout(() => {
            process.exit(0);
          }, 100);
          return;
        }

        stopServer(true);
        const updatedConfig = { ...newConfig, port: config.port };
        startServer(updatedConfig, projectRoot, true);
      });

      const gracefulShutdown = () => {
        console.log('\n\n👋 Shutting down TypeServe...');
        stopServer();
        setTimeout(() => {
          console.log('👋 Goodbye!');
          process.exit(0);
        }, 100);
      };

      process.on('SIGINT', gracefulShutdown);
      process.on('SIGTERM', gracefulShutdown);
    } catch (error) {
      console.error(
        colorize(
          `❌ Error starting server: ${error instanceof Error ? error.message : String(error)}`,
          colors.red
        )
      );
      process.exit(1);
    }
  });

program.parse();
