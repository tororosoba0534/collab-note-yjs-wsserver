import { Sessions } from "../auth/Sessions";
import { DBUsers } from "../database/dbTypes";
import knex from "../database/knex";
import { renderError } from "../utils/errorHandlings";
import { IsInvalid } from "../utils/validations";

export const checkAuth = async (sessionID: string): Promise<string> => {
  if (IsInvalid.sessionID(sessionID)) {
    return "";
  }

  try {
    const storedUsername = await Sessions.token2Username(sessionID);
    return storedUsername;
  } catch (e) {
    renderError(e);
    return "";
  }
};

export const logout = async (sessionID: string): Promise<boolean> => {
  if (IsInvalid.sessionID(sessionID)) {
    return false;
  }
  try {
    const storedUsername = await Sessions.token2Username(sessionID);
    if (!storedUsername) {
      return false;
    }

    const result = await Sessions.delete(sessionID);
    return result;
  } catch (e) {
    return false;
  }
};

export const deleteAccount = async (sessionID: string): Promise<boolean> => {
  if (IsInvalid.sessionID(sessionID)) {
    return false;
  }

  try {
    const storedUsername = await Sessions.token2Username(sessionID);

    if (!storedUsername) {
      return false;
    }

    const deleteResult = await knex.transaction(async (trx) => {
      const redisResult = await Sessions.delete(sessionID);

      await trx<DBUsers>("users").where("id", storedUsername).delete();

      return redisResult;
    });

    return deleteResult;
  } catch (e) {
    renderError(e);
    return false;
  }
};

export const changeUsername = async (
  oldSessionID: string,
  newUsername: any
): Promise<string> => {
  if (IsInvalid.sessionID(oldSessionID) || IsInvalid.username(newUsername)) {
    return "";
  }
  try {
    const oldUsername = await Sessions.token2Username(oldSessionID);
    if (!oldUsername) return "";

    const newSessionID: string = await knex.transaction(async (trx) => {
      const newSessionID = await Sessions.add(newUsername);
      await trx<DBUsers>("users")
        .where("id", oldUsername)
        .update({ id: newUsername });

      await Sessions.delete(oldSessionID);
      return newSessionID;
    });

    return newSessionID;
  } catch (e) {
    renderError(e);
    return "";
  }
};

export const changePassword = async (
  oldSessionID: string,
  newPassword: any
): Promise<string> => {
  if (IsInvalid.sessionID(oldSessionID) || IsInvalid.password(newPassword)) {
    return "";
  }
  try {
    const username = await Sessions.token2Username(oldSessionID);
    if (!username) return "";

    const newSessionID: string = await knex.transaction(async (trx) => {
      const newSessionID = await Sessions.add(username);
      await trx<DBUsers>("users")
        .where("id", username)
        .update({ password: newPassword });
      await Sessions.delete(oldSessionID);

      return newSessionID;
    });

    return newSessionID;
  } catch (e) {
    return "";
  }
};
