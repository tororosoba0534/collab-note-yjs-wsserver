type NODE_ENV_TYPE = "production" | "development" | "test";

const NODE_ENV = process.env.NODE_ENV as NODE_ENV_TYPE;

class ConfigClass {
  readonly NODE_ENV: NODE_ENV_TYPE;

  readonly server: {
    readonly PORT: number;
  };

  readonly db: {
    readonly CONNECTION_URI: string;
  };

  readonly redis: {
    readonly CONNECTION_URI: string;
  };

  readonly front: {
    readonly ORIGIN: string;
  };

  readonly SESSION_EXPIRATION_TIME: number;

  constructor() {
    this.NODE_ENV = NODE_ENV;
    this.server = {
      PORT: NODE_ENV === "production" ? Number(process.env.PORT) : 3001,
    };
    this.db = {
      CONNECTION_URI:
        NODE_ENV === "production"
          ? (process.env.DATABASE_URL as string)
          : "postgresql://dev:dev@localhost:5431/yjs_playground",
    };
    this.redis = {
      CONNECTION_URI:
        NODE_ENV === "production"
          ? (process.env.REDIS_URL as string)
          : "redis://localhost:6379",
    };
    this.front = {
      ORIGIN:
        NODE_ENV === "production"
          ? (process.env.FRONT_ORIGIN as string)
          : "http://localhost:3000",
    };

    this.SESSION_EXPIRATION_TIME = 5 * 60; // seconds
  }
}

const config = new ConfigClass();

export default config;
