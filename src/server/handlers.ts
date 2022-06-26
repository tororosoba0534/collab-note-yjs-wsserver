import { Sessions } from "../auth/Sessions";
import { DBUsers } from "../database/dbTypes";
import knexClient from "../database/knexClient";
import { renderError } from "../utils/errorHandlings";
import { IsNOTvalid } from "../utils/validations";
import { YDocsStore } from "../yjs/YDocsStore";
import { YjsWS } from "../yjs/YjsWS";

type ResultCreateAccount = {
  status: 200 | 400 | 403 | 500;
};
export const createAccount = async (
  userID: any,
  password: any
): Promise<ResultCreateAccount> => {
  if (IsNOTvalid.password(password) || IsNOTvalid.userID(userID)) {
    console.error("request type invalid.");
    return { status: 400 };
  }

  let dbResult: ResultCreateAccount;

  try {
    dbResult = await knexClient.transaction(async (trx) => {
      const stored = await trx<DBUsers>("users")
        .where("id", userID)
        .forUpdate();
      if (stored.length !== 0) {
        console.log("same ID already exists");

        return { status: 403 };
      }

      await trx<DBUsers>("users").insert({ id: userID, password });
      console.log("resister succeeded.");
      return { status: 200 };
    });
  } catch (e) {
    renderError(e);
    dbResult = { status: 500 };
  }

  return dbResult;
};

type ResultCheckUserID = {
  status: 200 | 400 | 403 | 500;
};
export const checkUserID = async (userID: any): Promise<ResultCheckUserID> => {
  if (IsNOTvalid.userID(userID)) {
    return { status: 400 };
  }

  try {
    const stored = await knexClient<DBUsers>("users").where("id", userID);

    if (stored.length !== 0) {
      return { status: 403 };
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
    const expectedPassword = storedUserData[0].password;
    if (!expectedPassword || expectedPassword !== password) {
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
  status: 200 | 401 | 500;
};
export const deleteAccount = async (
  sessionID: string
): Promise<ResultDeleteAccount> => {
  if (IsNOTvalid.sessionID(sessionID)) {
    return { status: 401 };
  }

  try {
    const storedUserID = await Sessions.token2UserID(sessionID);

    if (!storedUserID) {
      return { status: 401 };
    }

    const resultDA = await Sessions.deleteByUserID(storedUserID);
    if (!resultDA) return { status: 500 };

    const resultBroadcast = YjsWS.broadcastNotification(
      storedUserID,
      "deleteAccount"
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
  status: 200 | 400 | 401 | 500;
};
export const changeUserID = async (
  sessionID: string,
  newUserID: any
): Promise<ResultChangeUserID> => {
  if (IsNOTvalid.sessionID(sessionID)) {
    return { status: 401 };
  }

  if (IsNOTvalid.userID(newUserID)) {
    return { status: 400 };
  }

  try {
    const oldUserID = await Sessions.token2UserID(sessionID);
    if (!oldUserID) return { status: 401 };

    const resultCU = await Sessions.updateUserID(oldUserID, newUserID);
    if (!resultCU) return { status: 500 };

    const resultBroadcast = YjsWS.broadcastNotification(
      oldUserID,
      "changeUserID"
    );
    if (!resultBroadcast) return { status: 500 };

    const resultUpdateDocname = YDocsStore.updateDocname(oldUserID, newUserID);
    if (!resultUpdateDocname) return { status: 500 };

    return { status: 200 };
  } catch (e) {
    renderError(e);
    return { status: 500 };
  }
};

type ResultChangePassword = {
  staus: 200 | 400 | 401 | 500;
};
export const changePassword = async (
  sessionID: string,
  newPassword: any
): Promise<ResultChangePassword> => {
  if (IsNOTvalid.sessionID(sessionID)) {
    return { staus: 401 };
  }

  if (IsNOTvalid.password(newPassword)) {
    return { staus: 400 };
  }

  try {
    const userID = await Sessions.token2UserID(sessionID);
    if (!userID) return { staus: 401 };

    const result: boolean = await knexClient.transaction(async (trx) => {
      await trx<DBUsers>("users")
        .where("id", userID)
        .update({ password: newPassword });

      const resultBroadcast = YjsWS.broadcastNotification(
        userID,
        "changePassword"
      );
      if (!resultBroadcast) return false;

      return true;
    });

    if (!result) return { staus: 500 };

    return { staus: 200 };
  } catch (e) {
    return { staus: 500 };
  }
};
