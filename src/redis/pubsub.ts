import Redis from "ioredis";
import config from "../config";
// import { v4 as uuidv4 } from "uuid";
// import { renderError } from "../utils/errorHandlings";

export const pub = new Redis(config.redis.CONNECTION_URI);
export const sub = new Redis(config.redis.CONNECTION_URI);

// class RedisForPubSub extends Redis {
//   constructor(parameters: any) {
//     super(parameters);
//   }

//   publishBuffer(channel: string, message: Buffer) {
//     try {
//       // @ts-ignore
//       super.publishBuffer(channel, message);
//     } catch (e) {
//       renderError(e);
//     }
//   }
// }

// export const pub = new RedisForPubSub(config.redis.CONNECTION_URI);
// export const sub = new RedisForPubSub(config.redis.CONNECTION_URI);
