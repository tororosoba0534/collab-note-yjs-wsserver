import Redis from "ioredis";
import config from "../config";

/* Do NOT use this redis client execpt for:
    ・Implementing methods in Sessions class
    ・Testing methods in Sessions class
*/
export const _privateRedis4Sessions = new Redis(config.redis.CONNECTION_URI);
