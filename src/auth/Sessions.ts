import Redis from "ioredis";
import config from "../config";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";
import { IsNOTvalid } from "../utils/validations";
import { _privateRedis4Sessions } from "../redis/session";

/*
Usage of Redis in session management:
  key: sessionID
  value: username
  Expirration time set
*/
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
    const username = await _privateRedis4Sessions.get(sessionID);
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
    await _privateRedis4Sessions.set(newSessionID, username);
    await _privateRedis4Sessions.expire(
      newSessionID,
      config.SESSION_EXPIRATION_TIME
    );

    return newSessionID;
  };

  static delete = async (sessionID: string): Promise<boolean> => {
    if (IsNOTvalid.sessionID(sessionID)) {
      return false;
    }
    await _privateRedis4Sessions.del(sessionID);
    return true;
  };
}
