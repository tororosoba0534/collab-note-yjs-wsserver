import config from "../config";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";
import { IsNOTvalid } from "../utils/validations";
import { _privateRedis4Sessions } from "../redis/session";
import knexClient from "../database/knexClient";
import { DBSessions, DBUsers } from "../database/dbTypes";

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
    const date = new Date();
    const expireAt =
      Math.floor(date.getTime() / 1000) + config.SESSION_EXPIRATION_TIME;

    await knexClient<DBSessions>("sessions").insert({
      session_id: newSessionID,
      user_id: userID,
      expire_at: expireAt,
    });

    await _privateRedis4Sessions.set(newSessionID, userID);
    await _privateRedis4Sessions.expireat(newSessionID, expireAt);

    return newSessionID;
  };

  static deleteBySessionID = async (sessionID: string): Promise<boolean> => {
    if (IsNOTvalid.sessionID(sessionID)) {
      return false;
    }

    await knexClient<DBSessions>("sessions")
      .where("session_id", sessionID)
      .delete();

    await _privateRedis4Sessions.del(sessionID);
    return true;
  };

  static deleteByUserID = async (userID: string): Promise<boolean> => {
    if (IsNOTvalid.userID(userID)) {
      return false;
    }

    let dbResult: boolean;
    try {
      dbResult = await knexClient.transaction(async (trx) => {
        const dbSessions = await trx<DBSessions>("sessions").where(
          "user_id",
          userID
        );

        if (dbSessions.length === 0) {
          return false;
        }

        await trx<DBUsers>("users").where("id", userID).delete();

        // await Promise.all(dbSessions.map(async (session) => {
        //   return await _privateRedis4Sessions.del()
        // }))

        await _privateRedis4Sessions.del(dbSessions.map((s) => s.session_id));

        return true;
      });
    } catch (e) {
      dbResult = false;
    }

    return dbResult;
  };

  static updateUserID = async (
    oldUserID: string,
    newUserID: string
  ): Promise<boolean> => {
    if (IsNOTvalid.userID(oldUserID) || IsNOTvalid.userID(newUserID)) {
      return false;
    }

    let dbResult: boolean;
    try {
      dbResult = await knexClient.transaction(async (trx) => {
        const dbSessions = await trx<DBSessions>("sessions").where(
          "user_id",
          oldUserID
        );

        if (dbSessions.length === 0) {
          return false;
        }

        const checkUserID = await trx<DBUsers>("users").where("id", newUserID);

        if (checkUserID.length !== 0) {
          return false;
        }

        await trx<DBUsers>("users")
          .where("id", oldUserID)
          .update("id", newUserID);

        await Promise.all(
          dbSessions.map(
            async (s) =>
              await _privateRedis4Sessions.set(
                s.session_id,
                newUserID,
                "KEEPTTL"
              )
          )
        );

        return true;
      });
    } catch (e) {
      dbResult = false;
    }

    return dbResult;
  };
}
