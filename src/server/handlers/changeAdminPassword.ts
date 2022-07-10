import { Sessions } from "../../auth/Sessions";
import { DBUsers } from "../../database/dbTypes";
import knexClient from "../../database/knexClient";
import { isNotSameHash, hashPassword } from "../../utils/hashPassword";
import { IsNOTvalid } from "../../utils/validations";
import { yjsConsts } from "../../yjs/yjsConsts";
import { YjsWS } from "../../yjs/YjsWS";

type ResultChangeAdminPassword = {
  status: 200 | 400 | 401 | 403 | 409 | 500;
};
export const changeAdminPassword = async (
  sessionID: string,
  oldAdminPassword: any,
  newAdminPassword: any
): Promise<ResultChangeAdminPassword> => {
  if (IsNOTvalid.sessionID(sessionID)) {
    return { status: 401 };
  }

  if (IsNOTvalid.password(oldAdminPassword)) {
    return { status: 403 };
  }

  if (IsNOTvalid.password(newAdminPassword)) {
    return { status: 400 };
  }

  try {
    const userID = await Sessions.token2UserID(sessionID);
    if (!userID) return { status: 401 };

    const storedUserInfo = await knexClient<DBUsers>("users").where(
      "id",
      userID
    );

    // const oldAdminHash = hashPassword(oldAdminPassword);
    // if (storedUserInfo[0].admin_hash !== oldAdminHash) {
    if (isNotSameHash(oldAdminPassword, storedUserInfo[0].admin_hash)) {
      return { status: 403 };
    }
    // const newAdminHash = hashPassword(newAdminPassword);
    // if (storedUserInfo[0].hash === newAdminHash) {
    if (!isNotSameHash(newAdminPassword, storedUserInfo[0].hash)) {
      return { status: 409 };
    }

    const newAdminHash = hashPassword(newAdminPassword);
    const result: boolean = await knexClient.transaction(async (trx) => {
      await trx<DBUsers>("users")
        .where("id", userID)
        .update({ admin_hash: newAdminHash });

      const resultBroadcast = YjsWS.broadcastNotification(
        userID,
        yjsConsts.MESSAGE_CHANGE_ADMIN_PASSWORD
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
