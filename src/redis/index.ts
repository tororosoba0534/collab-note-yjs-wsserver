import Redis from "ioredis";
import config from "../config";
import { v4 as uuidv4 } from "uuid";

export const pub = new Redis(config.redis.CONNECTION_URI);
export const sub = new Redis(config.redis.CONNECTION_URI);
