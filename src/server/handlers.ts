import { Sessions } from "../auth/Sessions";
import { DBUsers } from "../database/dbTypes";
import knexClient from "../database/knexClient";
import { renderError } from "../utils/errorHandlings";
import { hashPassword, isNotSameHash } from "../utils/hashPassword";
import { IsNOTvalid } from "../utils/validations";
import { makeInitContent } from "../yjs/prosemirror";
import { yjsConsts } from "../yjs/yjsConsts";
import { YjsDB } from "../yjs/YjsDB";
import { YjsWS } from "../yjs/YjsWS";

type ResultCreateAccount = {
  status: 200 | 400 | 409 | 500;
};
export const createAccount = async (
  userID: any,
  password: any,
  adminPassword: any
): Promise<ResultCreateAccount> => {
  if (
    IsNOTvalid.password(password) ||
    IsNOTvalid.userID(userID) ||
    IsNOTvalid.password(adminPassword)
  ) {
    console.error("request type invalid.");
    return { status: 400 };
  }

  if (password === adminPassword) {
    console.error("adminPassword should differ from password.");
    return { status: 400 };
  }

  let dbResult: ResultCreateAccount;

  try {
    const hash = hashPassword(password);
    const adminHash = hashPassword(adminPassword);

    dbResult = await knexClient.transaction(async (trx) => {
      const stored = await trx<DBUsers>("users")
        .where("id", userID)
        .forUpdate();
      if (stored.length !== 0) {
        console.log("same ID already exists");

        return { status: 409 };
      }

      await trx<DBUsers>("users").insert({
        id: userID,
        hash,
        admin_hash: adminHash,
      });

      console.log("resister succeeded.");
      return { status: 200 };
    });

    await YjsDB.persistUpdate(userID, makeInitContent());
  } catch (e) {
    renderError(e);
    dbResult = { status: 500 };
  }

  return dbResult;
};

type ResultCheckUserID = {
  status: 200 | 400 | 409 | 500;
};
export const checkUserID = async (userID: any): Promise<ResultCheckUserID> => {
  if (IsNOTvalid.userID(userID)) {
    return { status: 400 };
  }

  try {
    const stored = await knexClient<DBUsers>("users").where("id", userID);

    if (stored.length !== 0) {
      return { status: 409 };
    }
    return { status: 200 };
  } catch (e) {
    renderError(e);
    return { status: 500 };
  }
};

type ResultLogin = {
  status: 200 | 400 | 401 | 500;
  sessionID: string;
};
export const login = async (
  userID: any,
  password: any
): Promise<ResultLogin> => {
  if (IsNOTvalid.userID(userID) || IsNOTvalid.password(password)) {
    return { status: 400, sessionID: "" };
  }

  try {
    const storedUserData = await knexClient<DBUsers>("users")
      .where("id", userID)
      .then((stored) => {
        console.log(`user data in postgres: ${JSON.stringify(stored)}`);
        return stored;
      });

    if (storedUserData.length === 0) {
      console.log("user does NOT exist.");
      return { status: 401, sessionID: "" };
    }
    const storedHash = storedUserData[0].hash;
    if (!storedHash) {
      return { status: 401, sessionID: "" };
    }

    // const hash = hashPassword(password);
    // console.log(`submit hash: ${hash}`);
    if (isNotSameHash(password, storedHash)) {
      return { status: 401, sessionID: "" };
    }

    const sessionID = await Sessions.add(userID);

    console.log(`sessionID generated: ${sessionID}`);
    return { status: 200, sessionID };
  } catch (e) {
    renderError(e);
    return { status: 500, sessionID: "" };
  }
};

type ResultCheckAuth = {
  status: 200 | 401 | 500;
  userID: string;
};
export const checkAuth = async (
  sessionID: string
): Promise<ResultCheckAuth> => {
  if (IsNOTvalid.sessionID(sessionID)) {
    return { status: 401, userID: "" };
  }

  try {
    const storedUserID = await Sessions.token2UserID(sessionID);
    if (!storedUserID) {
      return { status: 401, userID: "" };
    }
    return { status: 200, userID: storedUserID };
  } catch (e) {
    renderError(e);
    return { status: 500, userID: "" };
  }
};

type ResultLogout = {
  status: 200 | 401 | 500;
};
export const logout = async (sessionID: string): Promise<ResultLogout> => {
  if (IsNOTvalid.sessionID(sessionID)) {
    return { status: 401 };
  }
  try {
    const storedUserID = await Sessions.token2UserID(sessionID);
    if (!storedUserID) {
      return { status: 401 };
    }

    const result = await Sessions.deleteBySessionID(sessionID);
    if (!result) {
      return { status: 500 };
    }
    return { status: 200 };
  } catch (e) {
    return { status: 500 };
  }
};

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

    const storedUserInfo = await knexClient<DBUsers>("users").where(
      "id",
      storedUserID
    );
    if (isNotSameHash(adminPassword, storedUserInfo[0].admin_hash)) {
      return { status: 403 };
    }

    const resultDA = await Sessions.deleteByUserID(storedUserID);
    if (!resultDA) return { status: 500 };

    const resultBroadcast = YjsWS.broadcastNotification(
      storedUserID,
      yjsConsts.MESSAGE_DELETE_ACCOUNT
    );
    if (!resultBroadcast) return { status: 500 };

    const resultCloseConn = YjsWS.closeAll(storedUserID);
    if (!resultCloseConn) return { status: 500 };

    return { status: 200 };
  } catch (e) {
    renderError(e);
    return { status: 500 };
  }
};

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
    const sameIDUsers = await knexClient<DBUsers>("users").where(
      "id",
      newUserID
    );
    if (sameIDUsers[0].id) {
      return { status: 409 };
    }

    const oldUserID = await Sessions.token2UserID(sessionID);
    if (!oldUserID) return { status: 401 };

    if (IsNOTvalid.password(adminPassword)) {
      return { status: 403 };
    }
    const oldUserInfo = await knexClient<DBUsers>("users").where(
      "id",
      oldUserID
    );
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

type ResultChangePassword = {
  status: 200 | 400 | 401 | 403 | 500;
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

    const storedUserInfo = await knexClient<DBUsers>("users").where(
      "id",
      userID
    );

    // const adminHash = hashPassword(adminPassword);

    // if (storedUserInfo[0].admin_hash !== adminHash) {
    if (isNotSameHash(adminPassword, storedUserInfo[0].admin_hash)) {
      return { status: 403 };
    }
    // if (storedUserInfo[0].hash === adminHash) {
    if (!isNotSameHash(adminPassword, storedUserInfo[0].hash)) {
      return { status: 400 };
    }

    const newHash = hashPassword(newPassword);

    const result: boolean = await knexClient.transaction(async (trx) => {
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

type ResultChangeAdminPassword = {
  status: 200 | 400 | 401 | 403 | 500;
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
    if (!isNotSameHash(newAdminPassword, storedUserInfo[0].admin_hash)) {
      return { status: 400 };
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
