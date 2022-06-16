import config from "../config";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";
import { IsNOTvalid } from "../utils/validations";
import { _privateRedis4Sessions } from "../redis/session";

/*
Usage of Redis in session management:
  key: sessionID
  value: userID
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

  static token2UserID = async (sessionID: string): Promise<string> => {
    const userID = await _privateRedis4Sessions.get(sessionID);
    if (!userID) {
      return "";
    }
    return userID;
  };

  static add = async (userID: string): Promise<string> => {
    if (IsNOTvalid.userID(userID)) {
      return "";
    }
    const newSessionID = uuidv4();
    await _privateRedis4Sessions.set(newSessionID, userID);
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
