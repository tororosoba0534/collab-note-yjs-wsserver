const config = {
  NODE_ENV: process.env.NODE_ENV,
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
};

export default config;
