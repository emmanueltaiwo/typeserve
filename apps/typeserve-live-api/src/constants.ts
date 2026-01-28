export const MAX_ACTIVE_SERVERS = 10;
export const MIN_EXPIRATION_MINUTES = 5;
export const MAX_EXPIRATION_HOURS = 2;
export const MAX_EXPIRATION_SECONDS = MAX_EXPIRATION_HOURS * 60 * 60;
export const MIN_EXPIRATION_SECONDS = MIN_EXPIRATION_MINUTES * 60;

export const REDIS_KEYS = {
  ACTIVE_SERVERS: 'typeserve:live:active_servers',
  SERVER_PREFIX: 'typeserve:live:server:',
  EXPIRATION_PREFIX: 'typeserve:live:expiration:',
  ROUTES_PREFIX: 'typeserve:live:routes:',
  TYPES_PREFIX: 'typeserve:live:types:',
} as const;

export const BULLMQ_QUEUE_NAME = 'typeserve-live-expiration';

export const RESERVED_SUBDOMAIN_NAMES = [
  'api',
  'test',
  'staging',
  'dev',
  'development',
  'www',
  'admin',
  'app',
  'apps',
  'mail',
  'email',
  'ftp',
  'localhost',
  'production',
  'prod',
  'demo',
  'docs',
  'documentation',
  'blog',
  'support',
  'help',
  'status',
  'monitor',
  'monitoring',
  'metrics',
  'health',
  'ping',
  'pong',
] as const;
