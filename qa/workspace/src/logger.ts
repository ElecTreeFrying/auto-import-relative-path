type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export const logger = {
  debug: (message: string, meta?: unknown) => emit('debug', message, meta),
  info: (message: string, meta?: unknown) => emit('info', message, meta),
  warn: (message: string, meta?: unknown) => emit('warn', message, meta),
  error: (message: string, meta?: unknown) => emit('error', message, meta),
};

function emit(level: LogLevel, message: string, meta?: unknown): void {
  const timestamp = new Date().toISOString();
  console[level === 'debug' ? 'log' : level](`[${timestamp}] ${level.toUpperCase()}: ${message}`, meta ?? '');
}
