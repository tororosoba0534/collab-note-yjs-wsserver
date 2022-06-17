import { Sessions } from "../auth/Sessions";
import { DBUsers } from "../database/dbTypes";
import knexClient from "../database/knexClient";
import { renderError } from "../utils/errorHandlings";
import { IsNOTvalid } from "../utils/validations";

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

    const result = await Sessions.delete(sessionID);
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

    const deleteResult: ResultDeleteAccount = await knexClient.transaction(
      async (trx) => {
        const redisResult = await Sessions.delete(sessionID);

        if (!redisResult) {
          return { status: 500 };
        }

        await trx<DBUsers>("users").where("id", storedUserID).delete();

        return { status: 200 };
      }
    );

    return deleteResult;
  } catch (e) {
    renderError(e);
    return { status: 500 };
  }
};

type ResultChangeUserID = {
  status: 200 | 400 | 401 | 500;
  newSessionID: string;
};
export const changeUserID = async (
  oldSessionID: string,
  newUserID: any
): Promise<ResultChangeUserID> => {
  if (IsNOTvalid.sessionID(oldSessionID)) {
    return { status: 401, newSessionID: "" };
  }

  if (IsNOTvalid.userID(newUserID)) {
    return { status: 400, newSessionID: "" };
  }

  try {
    const oldUserID = await Sessions.token2UserID(oldSessionID);
    if (!oldUserID) return { status: 401, newSessionID: "" };

    const newSessionID: string = await knexClient.transaction(async (trx) => {
      const newSessionID = await Sessions.add(newUserID);
      await trx<DBUsers>("users")
        .where("id", oldUserID)
        .update({ id: newUserID });

      await Sessions.delete(oldSessionID);
      return newSessionID;
    });

    return { status: 200, newSessionID };
  } catch (e) {
    renderError(e);
    return { status: 500, newSessionID: "" };
  }
};

type ResultChangePassword = {
  staus: 200 | 400 | 401 | 500;
  newSessionID: string;
};
export const changePassword = async (
  oldSessionID: string,
  newPassword: any
): Promise<ResultChangePassword> => {
  if (IsNOTvalid.sessionID(oldSessionID)) {
    return { staus: 401, newSessionID: "" };
  }

  if (IsNOTvalid.password(newPassword)) {
    return { staus: 400, newSessionID: "" };
  }

  try {
    const userID = await Sessions.token2UserID(oldSessionID);
    if (!userID) return { staus: 401, newSessionID: "" };

    const newSessionID: string = await knexClient.transaction(async (trx) => {
      const newSessionID = await Sessions.add(userID);
      await trx<DBUsers>("users")
        .where("id", userID)
        .update({ password: newPassword });
      await Sessions.delete(oldSessionID);

      return newSessionID;
    });

    return { staus: 200, newSessionID };
  } catch (e) {
    return { staus: 500, newSessionID: "" };
  }
};
