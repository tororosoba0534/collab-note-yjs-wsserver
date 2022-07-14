import { Sessions } from "../../auth/Sessions";
import { DB } from "../../database/DB";
import { DBUsers } from "../../database/dbTypes";
import { renderError } from "../../utils/errorHandlings";
import { isNotSameHash } from "../../utils/hashPassword";
import { IsNOTvalid } from "../../utils/validations";
import { yjsConsts } from "../../yjs/yjsConsts";
import { YjsWS } from "../../yjs/YjsWS";

type ResultDeleteAccount = {
  status: 200 | 401 | 403 | 500;
};
export const deleteAccount = async (
  sessionID: string,
  adminPassword: any
): Promise<ResultDeleteAccount> => {
  if (IsNOTvalid.sessionID(sessionID)) {
    return { status: 401 };
  }

  try {
    const storedUserID = await Sessions.token2UserID(sessionID);

    if (!storedUserID) {
      return { status: 401 };
    }

    if (IsNOTvalid.password(adminPassword)) {
      return { status: 403 };
    }

    const storedUserInfo = await DB.knex<DBUsers>("users").where(
      "id",
      storedUserID
    );
    if (isNotSameHash(adminPassword, storedUserInfo[0].admin_hash)) {
      return { status: 403 };
    }

    const resultDA = await Sessions.deleteByUserID(storedUserID);
    if (!resultDA) return { status: 500 };

    // const resultBroadcast = YjsWS.broadcastNotification(
    //   storedUserID,
    //   yjsConsts.MESSAGE_DELETE_ACCOUNT
    // );
    // if (!resultBroadcast) return { status: 500 };

    // const resultCloseConn = YjsWS.closeAll(storedUserID);
    // if (!resultCloseConn) return { status: 500 };
    YjsWS.broadcastNotification(storedUserID, yjsConsts.MESSAGE_DELETE_ACCOUNT);
    YjsWS.closeAll(storedUserID);

    return { status: 200 };
  } catch (e) {
    renderError(e);
    return { status: 500 };
  }
};
