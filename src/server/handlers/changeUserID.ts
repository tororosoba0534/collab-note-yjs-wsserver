import { Sessions } from "../../auth/Sessions";
import { DB } from "../../database/DB";
import { DBUsers } from "../../database/dbTypes";
import { renderError } from "../../utils/errorHandlings";
import { isNotSameHash } from "../../utils/hashPassword";
import { IsNOTvalid } from "../../utils/validations";
import { yjsConsts } from "../../yjs/yjsConsts";
import { YjsWS } from "../../yjs/YjsWS";

type ResultChangeUserID = {
  status: 200 | 400 | 401 | 403 | 409 | 500;
};
export const changeUserID = async (
  sessionID: string,
  adminPassword: any,
  newUserID: any
): Promise<ResultChangeUserID> => {
  if (IsNOTvalid.sessionID(sessionID)) {
    return { status: 401 };
  }

  if (IsNOTvalid.userID(newUserID)) {
    return { status: 400 };
  }

  try {
    const sameIDUsers = await DB.knex<DBUsers>("users").where("id", newUserID);
    if (sameIDUsers.length !== 0) {
      return { status: 409 };
    }

    const oldUserID = await Sessions.token2UserID(sessionID);
    if (!oldUserID) return { status: 401 };

    if (IsNOTvalid.password(adminPassword)) {
      return { status: 403 };
    }
    const oldUserInfo = await DB.knex<DBUsers>("users").where("id", oldUserID);
    // if (oldUserInfo[0].admin_hash !== hashPassword(adminPassword)) {
    if (isNotSameHash(adminPassword, oldUserInfo[0].admin_hash)) {
      return { status: 403 };
    }

    const resultCU = await Sessions.updateUserID(oldUserID, newUserID);
    if (!resultCU) return { status: 500 };

    const resultBroadcast = YjsWS.broadcastNotification(
      oldUserID,
      yjsConsts.MESSAGE_CHANGE_USER_ID
    );
    if (!resultBroadcast) return { status: 500 };

    const resultCloseConn = YjsWS.closeAll(oldUserID);
    if (!resultCloseConn) return { status: 500 };

    // const resultUpdateDocname = YDocsStore.updateDocname(oldUserID, newUserID);
    // if (!resultUpdateDocname) return { status: 500 };

    return { status: 200 };
  } catch (e) {
    renderError(e);
    return { status: 500 };
  }
};
