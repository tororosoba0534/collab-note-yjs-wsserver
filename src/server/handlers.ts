import { Sessions } from "../auth/Sessions";
import { DBUsers } from "../database/dbTypes";
import knexClient from "../database/knexClient";
import { renderError } from "../utils/errorHandlings";
import { IsNOTvalid } from "../utils/validations";

type ResultCreateAccount = {
  status: 200 | 400 | 500;
};
export const createAccount = async (
  username: any,
  password: any
): Promise<ResultCreateAccount> => {
  if (IsNOTvalid.password(password) || IsNOTvalid.username(username)) {
    console.error("request type invalid.");
    return { status: 400 };
  }

  let dbResult: ResultCreateAccount;

  try {
    dbResult = await knexClient.transaction(async (trx) => {
      const stored = await trx<DBUsers>("users")
        .where("id", username)
        .forUpdate();
      if (stored.length !== 0) {
        console.log("same name already exists");

        return { status: 400 };
      }

      await trx<DBUsers>("users").insert({ id: username, password });
      console.log("resister succeeded.");
      return { status: 200 };
    });
  } catch (e) {
    renderError(e);
    dbResult = { status: 500 };
  }

  return dbResult;
};

type ResultCheckUsername = {
  status: 200 | 400 | 500;
  isUnusedValidUsername: boolean;
};
export const checkUsername = async (
  username: any
): Promise<ResultCheckUsername> => {
  if (IsNOTvalid.username(username)) {
    return { status: 400, isUnusedValidUsername: false };
  }

  try {
    const stored = await knexClient<DBUsers>("users").where("id", username);

    if (stored.length !== 0) {
      return { status: 200, isUnusedValidUsername: false };
    }
    return { status: 200, isUnusedValidUsername: true };
  } catch (e) {
    renderError(e);
    return { status: 500, isUnusedValidUsername: false };
  }
};

type ResultLogin = {
  status: 200 | 400 | 401 | 500;
  sessionID: string;
};
export const login = async (
  username: any,
  password: any
): Promise<ResultLogin> => {
  if (IsNOTvalid.username(username) || IsNOTvalid.password(password)) {
    return { status: 400, sessionID: "" };
  }

  try {
    const storedUserData = await knexClient<DBUsers>("users")
      .where("id", username)
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

    const sessionID = await Sessions.add(username);

    console.log(`sessionID generated: ${sessionID}`);
    return { status: 200, sessionID };
  } catch (e) {
    renderError(e);
    return { status: 500, sessionID: "" };
  }
};

type ResultCheckAuth = {
  status: 200 | 401 | 500;
  username: string;
};
export const checkAuth = async (
  sessionID: string
): Promise<ResultCheckAuth> => {
  if (IsNOTvalid.sessionID(sessionID)) {
    return { status: 401, username: "" };
  }

  try {
    const storedUsername = await Sessions.token2Username(sessionID);
    if (!storedUsername) {
      return { status: 401, username: "" };
    }
    return { status: 200, username: storedUsername };
  } catch (e) {
    renderError(e);
    return { status: 500, username: "" };
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
    const storedUsername = await Sessions.token2Username(sessionID);
    if (!storedUsername) {
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
    const storedUsername = await Sessions.token2Username(sessionID);

    if (!storedUsername) {
      return { status: 401 };
    }

    const deleteResult: ResultDeleteAccount = await knexClient.transaction(
      async (trx) => {
        const redisResult = await Sessions.delete(sessionID);

        if (!redisResult) {
          return { status: 500 };
        }

        await trx<DBUsers>("users").where("id", storedUsername).delete();

        return { status: 200 };
      }
    );

    return deleteResult;
  } catch (e) {
    renderError(e);
    return { status: 500 };
  }
};

type ResultChangeUsername = {
  status: 200 | 400 | 401 | 500;
  newSessionID: string;
};
export const changeUsername = async (
  oldSessionID: string,
  newUsername: any
): Promise<ResultChangeUsername> => {
  if (IsNOTvalid.sessionID(oldSessionID)) {
    return { status: 401, newSessionID: "" };
  }

  if (IsNOTvalid.username(newUsername)) {
    return { status: 400, newSessionID: "" };
  }

  try {
    const oldUsername = await Sessions.token2Username(oldSessionID);
    if (!oldUsername) return { status: 401, newSessionID: "" };

    const newSessionID: string = await knexClient.transaction(async (trx) => {
      const newSessionID = await Sessions.add(newUsername);
      await trx<DBUsers>("users")
        .where("id", oldUsername)
        .update({ id: newUsername });

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
    const username = await Sessions.token2Username(oldSessionID);
    if (!username) return { staus: 401, newSessionID: "" };

    const newSessionID: string = await knexClient.transaction(async (trx) => {
      const newSessionID = await Sessions.add(username);
      await trx<DBUsers>("users")
        .where("id", username)
        .update({ password: newPassword });
      await Sessions.delete(oldSessionID);

      return newSessionID;
    });

    return { staus: 200, newSessionID };
  } catch (e) {
    return { staus: 500, newSessionID: "" };
  }
};
