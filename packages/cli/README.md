# typeserve CLI

Command-line interface for TypeServe - Generate live mock APIs from TypeScript types.

## Installation

### Local Installation (Recommended)

```bash
npm install -D typeserve
```

Then use with `npx`:

```bash
npx typeserve dev
```

## Commands

### `typeserve init`

Initialize a new `typeserve.config.ts` file in your project root.

```bash
npx typeserve init
```

This command will:

- Create a `typeserve.config.ts` file with default configuration
- If the file already exists, prompt you to confirm before overriding

**Example:**

```bash
# Create new config file
npx typeserve init

# If config exists, you'll be prompted:
# ⚠️  typeserve.config.ts already exists. Do you want to override? (y/n):
```

The generated config file includes:

- Default port: `7002`
- Default basePath: `'/api'`
- Empty routes array ready for your routes

### `typeserve dev`

Start the development server with hot reload.

```bash
npx typeserve dev
```

#### Options

- `-p, --port <port>` - Port number (default: 7002)
- `-c, --config <path>` - Config file path (default: `typeserve.config.ts`)

#### Examples

```bash
# Start on default port 7002
npx typeserve dev

# Start on custom port
npx typeserve dev --port 4000

# Use custom config file
npx typeserve dev --config ./my-config.ts
```

## Usage

### Basic Workflow

1. **Create your types** in any TypeScript file:

```typescript
// src/types.ts
export interface User {
  id: string;
  email: string;
  name: string;
}
```

2. **Create config file** using the init command:

```bash
npx typeserve init
```

Or create `typeserve.config.ts` manually:

```typescript
import { defineMock } from '@typeserve/core';

export default defineMock({
  port: 7002,
  basePath: '/api',
  routes: [
    {
      path: '/users',
      method: 'GET',
      type: 'User[]',
    },
    {
      path: '/users/:id',
      method: 'GET',
      type: 'User',
    },
    {
      path: '/users',
      method: 'POST',
      type: 'User',
    },
    {
      path: '/users/:id',
      method: 'PUT',
      type: 'User',
    },
    {
      path: '/users/:id',
      method: 'DELETE',
      type: 'User',
    },
  ],
});
```

3. **Start the server**:

```bash
npx typeserve dev
```

You'll see output like:

```
📖 Loading configuration...
✅ Configuration loaded successfully
📖 Parsing types...
   This may take a while depending on the number of types and project size.
✅ Types parsed in 29181ms
🚀 Attempting to start your server on port 7002...
✅ TypeServe running on http://localhost:7002/api (started in 29903ms)
📋 Available routes:
   GET /api/users → User[]
```

TypeServe parses all your types at startup to ensure fast response times. The initial parsing may take a moment depending on your project size, but subsequent requests will be lightning fast.

4. **Use your API**:

```bash
curl http://localhost:7002/api/users
```

### Port Management

If the specified port is already in use, TypeServe will automatically try the next available port:

```
🚀 Attempting to start your server on port 7002...
⚠️  Port 7002 is already in use. Attempting to start on port 7003...
✅ TypeServe running on http://localhost:7003/api
   (Originally attempted port 7002)
```

### Hot Reload

TypeServe automatically watches for changes:

- When `typeserve.config.ts` changes → Server reloads
- When any type used in config changes → Server reloads
- When related type files change → Server reloads

You'll see output like:

```
🔄 File changed: src/types.ts
📖 Parsing types and reloading server...
✅ Server reloaded in 245ms
```

TypeServe re-parses your types on each reload to ensure all changes are reflected.

### Request Logging

All requests are logged with timing information:

```
GET /api/users 200 45ms
POST /api/posts 201 52ms
GET /api/users/123 200 38ms
```

### Graceful Shutdown

Press `Ctrl+C` to stop the server:

```
👋 Shutting down TypeServe...
🛑 Stopping TypeServe server...
✅ Server stopped successfully
👋 Goodbye!
```

## Configuration

The CLI reads from `typeserve.config.ts` in your project root. See the [main README](../README.md) for configuration options.

## Troubleshooting

### Port Already in Use

TypeServe will automatically try the next port. If you want to use a specific port, make sure it's available or use the `--port` option.

### Type Not Found

Make sure:

- Your type is exported from the file
- The type name matches exactly (case-sensitive)
- The file is in a location TypeServe can find (or specify `file` in route config)

### Config Not Loading

- Ensure `typeserve.config.ts` is in your project root
- Check that the config exports a default object
- Verify all routes have required fields (`path`, `method`, `type`)

## Development

If you're working on TypeServe itself:

```bash
# Build the CLI
cd packages/cli
npm run build

# Run in development mode
npm run typeserve:dev dev
```

## License

AGPL-3.0
