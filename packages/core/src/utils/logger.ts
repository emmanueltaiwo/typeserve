const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

function colorize(text: string, color: string): string {
  return `${color}${text}${colors.reset}`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  } else if (ms < 60000) {
    const seconds = (ms / 1000).toFixed(1);
    return `${seconds}s`;
  } else {
    const minutes = Math.floor(ms / 60000);
    const remainingSeconds = ((ms % 60000) / 1000).toFixed(1);
    return `${minutes}m ${remainingSeconds}s`;
  }
}

export const logger = {
  info: (message: string) => {
    console.log(colorize(message, colors.cyan));
  },

  success: (message: string) => {
    console.log(colorize(message, colors.green));
  },

  warning: (message: string) => {
    console.log(colorize(message, colors.yellow));
  },

  error: (message: string) => {
    console.error(colorize(message, colors.red));
  },

  request: (
    method: string,
    path: string,
    statusCode: number,
    duration: number,
  ) => {
    const methodColor =
      method === 'GET'
        ? colors.blue
        : method === 'POST'
          ? colors.magenta
          : method === 'PUT'
            ? colors.yellow
            : method === 'DELETE'
              ? colors.red
              : colors.cyan;
    const statusColor =
      statusCode >= 200 && statusCode < 300
        ? colors.green
        : statusCode >= 300 && statusCode < 400
          ? colors.yellow
          : statusCode >= 400
            ? colors.red
            : colors.white;
    const durationColor =
      duration < 100
        ? colors.green
        : duration < 500
          ? colors.yellow
          : colors.red;

    const methodStr = colorize(method.padEnd(6), methodColor);
    const pathStr = colorize(path, colors.white);
    const statusStr = colorize(statusCode.toString(), statusColor);
    const durationStr = colorize(formatDuration(duration), durationColor);
    const emoji =
      statusCode >= 200 && statusCode < 300
        ? '✓'
        : statusCode >= 400
          ? '✗'
          : '→';

    console.log(`${emoji} ${methodStr} ${pathStr} ${statusStr} ${durationStr}`);
  },

  dim: (message: string) => {
    console.log(colorize(message, colors.dim));
  },
};
