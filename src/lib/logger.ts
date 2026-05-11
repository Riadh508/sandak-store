type Level = 'info' | 'warn' | 'error';

function log(level: Level, msg: string, meta?: unknown) {
  const entry = { t: Date.now(), level, msg, meta };
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/log', { method: 'POST', body: JSON.stringify(entry), keepalive: true }).catch(() => {});
  } else {
    (console[level] || console.log)(`[${level.toUpperCase()}]`, msg, meta ?? '');
  }
}

export const logger = {
  info: (msg: string, meta?: unknown) => log('info', msg, meta),
  warn: (msg: string, meta?: unknown) => log('warn', msg, meta),
  error: (msg: string, meta?: unknown) => log('error', msg, meta),
};
