const NODE_ENV = process.env.NODE_ENV as "production" | "development" | "test";

const config = {
  NODE_ENV,
  server: {
    PORT: NODE_ENV === "production" ? Number(process.env.PORT) : 3001,
  },
  db: {
    CONNECTION_URI:
      NODE_ENV === "production"
        ? (process.env.DATABASE_URL as string)
        : "postgresql://dev:dev@localhost:5431/yjs_playground",
  },
  redis: {
    CONNECTION_URI:
      NODE_ENV === "production"
        ? (process.env.REDIS_URL as string)
        : "redis://localhost:6379",
  },
  front: {
    ORIGIN:
      NODE_ENV === "production"
        ? (process.env.FRONT_ORIGIN as string)
        : "http://localhost:3000",
  },
  SESSION_EXPIRATION_TIME: 5 * 60, // seconds
};

export default config;
