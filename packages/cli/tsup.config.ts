import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  outDir: 'dist',
  clean: true,
  external: ['@typeserve/core'],
  banner: { js: '#!/usr/bin/env node' },
  sourcemap: false,
  dts: true,
});
