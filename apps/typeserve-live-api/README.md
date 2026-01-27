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
- ✅ Server capacity management (max 50 active servers)
- ✅ TypeScript type parsing and mock data generation
- ✅ Redis-backed storage
- ✅ Docker support for Railway deployment

## Tech Stack

- **Node.js** + **TypeScript**
- **Express** - Web framework
- **Redis** - Data storage
- **BullMQ** - Job queue for expiration & cleanup
- **Docker** - Containerization
- **@typeserve/core** - TypeScript type parsing and mock data generation

## Architecture

### Services

- **RedisService**: Manages all Redis operations (server data, expiration timestamps, routes, types)
- **BullMQService**: Handles delayed jobs for automatic server cleanup
- **ServerService**: Business logic for server creation, listing, and management

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

## Constraints

### Expiration

- **Required**: Expiration must be set
- **Minimum**: 5 minutes from creation
- **Maximum**: 2 hours from creation

### Server Limit

- **Maximum**: 50 active servers
- When limit is reached, returns `capacity_reached` error with `nextAvailableInSeconds`

### Automatic Cleanup

- Cleanup job scheduled via BullMQ at expiration time
- Removes server from active list
- Deletes all Redis data
- Cleans up temporary files and parsed type cache

## Environment Variables

```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# Redis Configuration
REDIS_URL=redis://localhost:6379
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
docker run -p 3000:3000 \
  -e REDIS_URL=redis://your-redis-host:6379 \
  typeserve-live-api
```

## Railway Deployment

The Dockerfile is configured for Railway deployment. Set the following environment variables in Railway:

- `REDIS_URL` - Your Redis connection string
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
│   └── server.service.ts # Server management logic
├── routes/
│   └── servers.routes.ts # API route handlers
├── handlers/
│   └── subdomain.handler.ts # Subdomain request handler
├── app.ts               # Express app configuration
└── index.ts             # Application entry point
```

## License

ISC
