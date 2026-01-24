# TypeServe

**Generate live mock APIs from your TypeScript types. No backend needed.**

TypeServe automatically creates a fully-functional Express server that generates realistic mock data from your TypeScript interfaces, types, and enums. Perfect for frontend developers who want to build without waiting for backend endpoints.

## ✨ Features

- 🎯 **TypeScript-first** - Uses your existing types, no OpenAPI or JSON Schema needed
- ⚡ **Lightning fast** - Parses types at startup for instant responses (2ms-200ms)
- 🔥 **Hot reload** - Automatically reloads when your types or config change
- 🎨 **Smart data generation** - Auto-detects emails, dates, IDs, and more
- 🔗 **Nested types** - Supports complex nested structures (`Post.user: User`)
- 📊 **Type-safe config** - Full TypeScript support with IntelliSense
- 🎲 **Configurable arrays** - Control array length (1-5 items)
- 📝 **Request logging** - See all requests with timing info
- 🌐 **Full HTTP support** - GET, POST, PUT, DELETE methods

## 🚀 Quick Start

### Installation

```bash
npm install -D typeserve
```

### 1. Define Your Types

Create your TypeScript types anywhere in your project:

```typescript
// src/types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  isActive: boolean;
  createdAt: string;
}

export interface Post {
  id: string;
  user: User;
  title: string;
  description: string;
  tags: string[];
  publishedAt: string;
  views: number;
}
```

### 2. Create Config

You can either create the config file manually or use the `init` command:

**Option A: Use the init command (recommended)**

```bash
npx typeserve init
```

This will create a `typeserve.config.ts` file with default settings.

**Option B: Create manually**

Create `typeserve.config.ts` in your project root:

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
      count: 5, // Generate 5 users (optional, defaults to 1-3)
    },
    {
      path: '/users/:id',
      method: 'GET',
      type: 'User',
    },
    {
      path: '/posts',
      method: 'GET',
      type: 'Post[]',
    },
    {
      path: '/posts',
      method: 'POST',
      type: 'Post',
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

### 3. Start the Server

```bash
npx typeserve dev
```

That's it! Your mock API is running at `http://localhost:7002/api`

## 📖 Usage Examples

### React with Fetch

```typescript
// components/UserList.tsx
import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  isActive: boolean;
  createdAt: string;
}

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch('http://localhost:7002/api/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      ))}
    </div>
  );
}
```

## 🎯 Use Cases

### Frontend Development

Build your UI without waiting for backend endpoints. TypeServe generates realistic data that matches your types exactly.

### API Design

Prototype your API structure using TypeScript types. Share the config with your backend team for implementation.

### Testing

Use TypeServe in your test environment to generate consistent mock data for integration tests.

### Demos & Prototypes

Quickly spin up a working API for demos, prototypes, or client presentations.

## 📚 Configuration

### Route Options

```typescript
{
  path: string;           // Route path (supports Express params like :id)
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'; // HTTP method
  type: string;           // TypeScript type name (supports arrays with [])
  file?: string;          // Optional: specific file path to type
  count?: 1 | 2 | 3 | 4 | 5; // Optional: array length (1-5)
}
```

### Config Options

```typescript
{
  port?: number;      // Server port (default: 7002)
  basePath?: string;  // API base path (default: '/api')
  routes: RouteConfig[];
}
```

## 🎨 Smart Field Detection

TypeServe automatically detects common field patterns and generates appropriate data:

- **Emails** - `email`, `userEmail` → `user@example.com`
- **IDs** - `id`, `userId`, `authorId` → UUIDs
- **Dates** - `createdAt`, `updatedAt`, `publishedAt` → ISO date strings
- **Names** - `name`, `userName` → Full names
- **URLs** - `url`, `imageUrl` → Valid URLs
- **Addresses** - `address` → Street addresses

## 🔥 Hot Reload

TypeServe watches your TypeScript files and automatically reloads when:

- Your `typeserve.config.ts` changes
- Any type used in your config changes
- Related type files are modified

When a change is detected, TypeServe re-parses your types and restarts the server. You'll see:

```
🔄 File changed: src/types.ts
📖 Parsing types and reloading server...
✅ Server reloaded in 245ms
```

Just save your file and the server reloads automatically!

## 🛠️ Development

### Using Locally (Monorepo)

If you're developing TypeServe itself:

```bash
# Install dependencies
npm install

# Build packages
npm run build

# Run CLI directly
npm run typeserve:dev dev

# Or use the built version
npm run typeserve dev
```

### Project Structure

```
typeserve/
├── packages/
│   ├── core/          # Core library (parsing, generation, server)
│   └── cli/           # CLI commands
├── typeserve.config.ts
└── src/
    └── types.ts       # Your TypeScript types
```

## 📝 License

AGPL-3.0

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

AGPL-3.0 © [Emmanuel Taiwo](https://github.com/emmanueltaiwo)
