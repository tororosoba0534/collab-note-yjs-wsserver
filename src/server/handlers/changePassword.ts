import { Sessions } from "../../auth/Sessions";
import { DB } from "../../database/DB";
import { DBUsers } from "../../database/dbTypes";
import { isNotSameHash, hashPassword } from "../../utils/hashPassword";
import { IsNOTvalid } from "../../utils/validations";
import { yjsConsts } from "../../yjs/yjsConsts";
import { YjsWS } from "../../yjs/YjsWS";

type ResultChangePassword = {
  status: 200 | 400 | 401 | 403 | 409 | 500;
};
export const changePassword = async (
  sessionID: string,
  adminPassword: any,
  newPassword: any
): Promise<ResultChangePassword> => {
  if (IsNOTvalid.sessionID(sessionID)) {
    return { status: 401 };
  }

  if (IsNOTvalid.password(newPassword)) {
    return { status: 400 };
  }

  try {
    const userID = await Sessions.token2UserID(sessionID);
    if (!userID) return { status: 401 };

    if (IsNOTvalid.password(adminPassword)) {
      return { status: 403 };
    }

    const storedUserInfo = await DB.knex<DBUsers>("users").where("id", userID);

    // const adminHash = hashPassword(adminPassword);

    // if (storedUserInfo[0].admin_hash !== adminHash) {
    if (isNotSameHash(adminPassword, storedUserInfo[0].admin_hash)) {
      return { status: 403 };
    }
    // if (storedUserInfo[0].hash === adminHash) {
    if (!isNotSameHash(adminPassword, storedUserInfo[0].hash)) {
      return { status: 409 };
    }

    const newHash = hashPassword(newPassword);

    const result: boolean = await DB.knex.transaction(async (trx) => {
      await trx<DBUsers>("users").where("id", userID).update({ hash: newHash });

      const resultBroadcast = YjsWS.broadcastNotification(
        userID,
        yjsConsts.MESSAGE_CHANGE_PASSWORD
      );
      if (!resultBroadcast) return false;

      return true;
    });

    if (!result) return { status: 500 };

    return { status: 200 };
  } catch (e) {
    return { status: 500 };
  }
};
