import Redis from "ioredis";
import config from "../config";

export const pub = new Redis(config.redis.CONNECTION_URI);
export const sub = new Redis(config.redis.CONNECTION_URI);
