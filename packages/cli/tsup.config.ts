import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  outDir: 'dist',
  clean: true,
  external: ['@typeserve/core'],
  sourcemap: false,
  dts: true,
});
