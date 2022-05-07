const config = {
  server: {
    port: Number(process.env.PORT) || 3001,
  },
  db: {
    host: process.env.DB_HOST as string,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER as string,
    name: process.env.DB_NAME as string,
    password: process.env.DB_PASSWORD as string,
    connectionURI: process.env.DATABASE_URL as string,
  },
  redis: {
    host: process.env.REDIS_HOST as string,
    port: Number(process.env.REDIS_PORT),
    keyPrefix: process.env.REDIS_PREFIX as string,
  },
};

export default config;
