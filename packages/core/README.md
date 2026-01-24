# @typeserve/core

Core library for TypeServe — generate mock APIs from your TypeScript types.

## Installation

```bash
npm install @typeserve/core
```

## Usage

### Define your config

```typescript
import { defineMock, createRoute } from '@typeserve/core';

export default defineMock({
  port: 3000,
  basePath: '/api',
  routes: [
    createRoute({
      path: '/users',
      method: 'GET',
      type: 'User',
      file: './src/types.ts',
      count: 5, // returns array of 5 items
    }),
  ],
});
```

### Types

```typescript
interface RouteConfig {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  type: string;        // Name of the TypeScript type
  file?: string;       // Path to the types file
  count?: 1 | 2 | 3 | 4 | 5; // Array length (optional)
}

interface TypeServeConfig {
  routes: RouteConfig[];
  port?: number;       // Default: 3000
  basePath?: string;   // API prefix
}
```

## API

| Export | Description |
|--------|-------------|
| `defineMock(config)` | Define your mock configuration |
| `createRoute(route)` | Create a route with validation |
| `loadConfig(path)` | Load config from file |
| `parseTypes(file, typeName)` | Parse TypeScript types |
| `generateData(parsedType)` | Generate mock data |
| `startServer(config)` | Start the mock server |
| `watchFiles(paths, callback)` | Watch for file changes |

## License

AGPL-3.0
