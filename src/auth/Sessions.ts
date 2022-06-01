import Redis from "ioredis";
import config from "../config";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";
import { IsNOTvalid } from "../utils/validations";

/*
sessionsRedisStore
key: sessionID
value: username
Expirration time set
*/
const sessionsRedis = new Redis(config.redis.CONNECTION_URI);

export class Sessions {
  static req2Token = (req: Request): string => {
    /* 
        If you use cookie to send sessionID, then you should rewrite here. For example:
            const sessionID = parseCookies(req.headers.cookie || "")?.sessionID;
    */
    const { sessionID } = req.body;
    if (IsNOTvalid.sessionID(sessionID)) return "";
    return sessionID;
  };

  static token2Username = async (sessionID: string): Promise<string> => {
    const username = await sessionsRedis.get(sessionID);
    if (!username) {
      return "";
    }
    return username;
  };

  static add = async (username: string): Promise<string> => {
    if (IsNOTvalid.username(username)) {
      return "";
    }
    const newSessionID = uuidv4();
    await sessionsRedis.set(newSessionID, username);
    await sessionsRedis.expire(newSessionID, config.SESSION_EXPIRATION_TIME);

    return newSessionID;
  };

  static delete = async (sessionID: string): Promise<boolean> => {
    if (!sessionID) {
      return false;
    }
    await sessionsRedis.del(sessionID);
    return true;
  };
}
