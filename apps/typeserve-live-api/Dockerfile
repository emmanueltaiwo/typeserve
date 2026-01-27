FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/core/package.json ./packages/core/
COPY apps/typeserve-live-api/package.json ./apps/typeserve-live-api/

# Install dependencies
RUN npm ci

# Copy source files
COPY packages/core ./packages/core
COPY apps/typeserve-live-api ./apps/typeserve-live-api
COPY tsconfig.json ./
COPY packages/typescript-config ./packages/typescript-config

# Build core package
WORKDIR /app/packages/core
RUN npm run build

# Build API
WORKDIR /app/apps/typeserve-live-api
RUN npm run build
RUN test -f dist/index.js || (echo "Build failed - dist/index.js not found" && ls -la dist/ && exit 1)

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/core/package.json ./packages/core/
COPY apps/typeserve-live-api/package.json ./apps/typeserve-live-api/

# Install production dependencies only
RUN npm ci --production

# Copy built files
COPY --from=builder /app/packages/core/dist ./packages/core/dist
COPY --from=builder /app/packages/core/package.json ./packages/core/
COPY --from=builder /app/apps/typeserve-live-api/dist ./apps/typeserve-live-api/dist

# Verify dist folder exists
RUN ls -la /app/apps/typeserve-live-api/dist/ || (echo "dist folder missing in production stage" && exit 1)

WORKDIR /app/apps/typeserve-live-api

# Expose port (Railway will set PORT env var)
EXPOSE 7005

# Set environment variables
ENV NODE_ENV=production
ENV PORT=7005

# Start the application
CMD ["node", "dist/index.js"]
