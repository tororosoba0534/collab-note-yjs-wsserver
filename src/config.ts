const config = {
  NODE_ENV: process.env.NODE_ENV as "production" | "development" | "test",
  server: {
    PORT: Number(process.env.PORT),
  },
  db: {
    CONNECTION_URI: process.env.DATABASE_URL as string,
  },
  redis: {
    CONNECTION_URI: process.env.REDIS_URL as string,
  },
  front: {
    ORIGIN: process.env.FRONT_ORIGIN as string,
  },
  SESSION_EXPIRATION_TIME: 5 * 60, // seconds
};

export default config;
