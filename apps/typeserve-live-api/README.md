# Typeserve Live API

Backend API for Typeserve Live - a temporary live mock API platform.

## Overview

Typeserve Live allows users to create temporary mock APIs based on TypeScript types and routes. Each API:

- Runs on a subdomain (e.g., `my-api.typeserve.live`)
- Has a mandatory expiration time (5 minutes to 2 hours)
- Is automatically removed after expiration
- Uses Typeserve core to generate responses from TypeScript types

## Features

- ✅ Temporary mock API servers with subdomain routing
- ✅ Automatic expiration and cleanup via BullMQ
- ✅ Server capacity management (max 10 active servers)
- ✅ TypeScript type parsing and mock data generation
- ✅ Redis-backed storage
- ✅ Docker support for Railway deployment
- ✅ Strong validation of routes, types, and paths
- ✅ Per-IP and per-subdomain rate limiting (Limitly)
- ✅ Subdomain warmup endpoint for Railway routing stability

## Tech Stack

- **Node.js** + **TypeScript**
- **Express** - Web framework
- **Redis** - Data storage
- **BullMQ** - Job queue for expiration & cleanup
- **Docker** - Containerization
- **@typeserve/core** - TypeScript type parsing and mock data generation
- **limitly-sdk** - Redis-backed rate limiting

## Architecture

### Services

- **RedisService**: Manages all Redis operations (server data, expiration timestamps, routes, types)
- **BullMQService**: Handles delayed jobs for automatic server cleanup
- **ServerService**: Business logic for server creation, listing, management, and subdomain warmup
- **ValidationService**: Validates server requests (routes, response types, TypeScript code, Express paths)
- **CleanupService**: Periodic safety-net cleanup for expired servers
- **RateLimitService**: Centralizes rate limiting using Limitly and Redis

### Middleware & Observability

- CORS and JSON body parsing
- Request timeout guard (30s)
- Request ID injection with `X-Request-ID` response header
- Structured request logging (method, path, hostname, status, duration)
- Centralized error handler with safe production messages

### API Endpoints

#### `POST /servers`

Create a new mock server.

**Request Body:**

```json
{
  "name": "my-api",
  "expiresAt": "2026-01-26T15:30:00.000Z",
  "routes": [
    {
      "method": "GET",
      "path": "/users",
      "responseType": "User[]"
    }
  ],
  "types": "export type User = { id: string; name: string }"
}
```

**Response (201):**

```json
{
  "name": "my-api",
  "subdomain": "my-api.typeserve.live",
  "expiresAt": "2026-01-26T15:30:00.000Z",
  "createdAt": "2026-01-26T13:30:00.000Z"
}
```

**Response (503 - Capacity Reached):**

```json
{
  "error": "capacity_reached",
  "nextAvailableInSeconds": 840
}
```

**Response (400 - Validation Error):**

```json
{
  "error": "validation_error",
  "message": "Human-readable validation error message"
}
```

**Response (409 - Duplicate Subdomain):**

```json
{
  "error": "duplicate_subdomain",
  "message": "Server name \"my-api\" is already taken. Please choose a different name.",
  "subdomain": "my-api.typeserve.live",
  "requestId": "..."
}
```

**Response (429 - Rate Limit):**

```json
{
  "error": "rate_limit_exceeded",
  "message": "Maximum 5 server creations per hour. Please try again later.",
  "retryAfter": 123
}
```

#### `GET /servers`

List all active servers.

**Response (200):**

```json
[
  {
    "name": "my-api",
    "subdomain": "my-api.typeserve.live",
    "expiresAt": "2026-01-26T15:30:00.000Z",
    "createdAt": "2026-01-26T13:30:00.000Z",
    "expiresInSeconds": 7200
  }
]
```

**Response (429 - Rate Limit):** same shape as above `rate_limit_exceeded` payload.

#### `GET /health`

Basic health check endpoint. Verifies API is running and (optionally) Redis connectivity.

**Response (200):**

```json
{
  "status": "ok",
  "timestamp": "2026-01-26T13:30:00.000Z",
  "uptime": 123.45
}
```

**Response (503):**

```json
{
  "status": "unhealthy",
  "timestamp": "2026-01-26T13:30:00.000Z",
  "error": "Redis connection failed"
}
```

### Subdomain Routing

Requests to `*.typeserve.live` are handled dynamically:

- Extract subdomain from `Host` header
- Load server data from Redis
- Match route by path and method
- Generate mock data using Typeserve core
- Return JSON response

**Example:**

```
GET my-api.typeserve.live/users
→ Returns mock data for User[] type
```

### Subdomain Warmup

After a server is created, the API pre-warms the Railway routing layer by calling:

```text
GET https://{subdomain}.typeserve.live/__warmup
```

The warmup route:

- Validates that the subdomain exists and is not expired
- Returns a simple JSON payload:

```json
{
  "status": "ok",
  "message": "Server is ready",
  "subdomain": "my-api"
}
```

This helps prevent the first real request from hitting a cold route.

## Constraints

### Expiration

- **Required**: Expiration must be set
- **Minimum**: 5 minutes from creation
- **Maximum**: 2 hours from creation

### Server Limit

- **Maximum**: 10 active servers
- When limit is reached, returns `capacity_reached` error with `nextAvailableInSeconds`

### Automatic Cleanup

- Cleanup job scheduled via BullMQ at expiration time
- Removes server from active list
- Deletes all Redis data
- Cleans up temporary files and parsed type cache

### Rate Limiting

All rate limiting is handled via [Limitly](https://www.npmjs.com/package/limitly-sdk) backed by Redis:

- **Server creation** (`POST /servers`): max **5 requests per hour per IP**
- **List servers** (`GET /servers`): max **60 requests per minute per IP**
- **Subdomain API traffic** (`https://{subdomain}.typeserve.live/*`):
  - max **1000 requests per minute per subdomain**
- Warmup endpoint (`/__warmup`) is **not** rate limited

## Environment Variables

```bash
# Server Configuration
PORT=7005
NODE_ENV=production

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Limitly (Rate Limiting) Redis
LIMITLY_REDIS_URL=redis://localhost:6379
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Start production server
npm start
```

## Docker

```bash
# Build image
docker build -t typeserve-live-api .

# Run container
docker run -p 7005:7005 \
  -e REDIS_URL=redis://your-redis-host:6379 \
  -e LIMITLY_REDIS_URL=redis://your-limitly-redis-host:6379 \
  typeserve-live-api
```

## Railway Deployment

The Dockerfile is configured for Railway deployment. Set the following environment variables in Railway:

- `REDIS_URL` - Your Redis connection string
- `LIMITLY_REDIS_URL` - Redis connection string for Limitly (can be same as `REDIS_URL`)
- `PORT` - Server port (Railway sets this automatically)
- `NODE_ENV=production`

## Project Structure

```
src/
├── constants.ts          # Application constants
├── types.ts             # TypeScript type definitions
├── services/
│   ├── redis.service.ts  # Redis operations
│   ├── bullmq.service.ts # BullMQ job queue
│   ├── server.service.ts # Server management & warmup logic
│   ├── validation.service.ts # Validation of routes, paths, and types
│   ├── cleanup.service.ts # Periodic safety-net cleanup
│   └── rate-limit.service.ts # Limitly-based rate limiting
├── routes/
│   └── servers.routes.ts # API route handlers
├── handlers/
│   └── subdomain.handler.ts # Subdomain request & warmup handler
├── app.ts               # Express app configuration
└── index.ts             # Application entry point
```

## License

ISC
