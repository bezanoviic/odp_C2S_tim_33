export const HEALTH_CHECK_TIMEOUT = parseInt(process.env.DB_HEALTH_TIMEOUT_MS ?? "2000", 10);
export const HEALTH_CHECK_INTERVAL_MS = parseInt(process.env.DB_HEALTH_INTERVAL_MS ?? "10000", 10);

// TODO: Add your domain-specific constants here
// export const SOME_LIMIT = 100;
