# Testing TypeServe Locally

## Step 1: Install Dependencies

From the root of the turborepo:

```bash
npm install
```

This will install all dependencies for all packages in the workspace.

## Step 2: Build the Packages

Build both core and CLI packages:

```bash
turbo run build
```

## Step 3: Run TypeServe

### Option A: Using the built CLI (Recommended)

From the root directory:

```bash
npm run typeserve:dev dev
```

## Step 4: Test the Endpoints

Once the server is running, you should see output like:

```
🚀 TypeServe running on http://localhost:7002/api
📋 Available routes:
   GET /api/users → User
   GET /api/users/:id → User
   GET /api/posts → Post[]
   POST /api/posts → Post
```

### Test GET /api/users
```bash
curl http://localhost:7002/api/users
```

Expected: Returns a single User object with fake data.

### Test GET /api/users/:id
```bash
curl http://localhost:7002/api/users/123
```

Expected: Returns a single User object (route params are ignored for now).

### Test GET /api/posts
```bash
curl http://localhost:7002/api/posts
```

Expected: Returns an array of Post objects.

### Test POST /api/posts
```bash
curl -X POST http://localhost:7002/api/posts
```

Expected: Returns a single Post object.

## Step 5: Test Hot Reload

1. Keep the server running
2. Edit `typeserve.config.ts` or `src/types.ts`
3. Watch the console - it should automatically reload:
   ```
   🔄 File changed: typeserve.config.ts
   ✅ Server reloaded
   ```

## Troubleshooting

### Module not found errors
- Make sure you've run `npm install` from the root
- Rebuild packages: `npm run build`

### Type resolution errors
- Check that `tsconfig.json` files are correct
- Run `npm run check-types` to verify TypeScript compilation
