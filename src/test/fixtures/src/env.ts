export const env = {
  apiUrl: process.env.API_URL ?? 'http://localhost:3000',
  isProduction: process.env.NODE_ENV === 'production',
  sentryDsn: process.env.SENTRY_DSN,
} as const;
