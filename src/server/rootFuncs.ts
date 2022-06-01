import { Sessions } from "../auth/Sessions";
import { DBUsers } from "../database/dbTypes";
import knex from "../database/knex";
import { renderError } from "../utils/errorHandlings";
import { IsInvalid } from "../utils/validations";

export const register = async (
  username: any,
  password: any
): Promise<boolean> => {
  if (IsInvalid.password(password) || IsInvalid.username(username)) {
    console.error("request type invalid.");
    return false;
  }

  let dbResult: boolean;

  try {
    dbResult = await knex.transaction(async (trx) => {
      const stored = await trx<DBUsers>("users")
        .where("id", username)
        .forUpdate();
      if (stored.length !== 0) {
        console.log("same name already exists");

        return false;
      }

      await trx<DBUsers>("users").insert({ id: username, password });
      console.log("resister succeeded.");
      return true;
    });
  } catch (e) {
    renderError(e);
    dbResult = false;
  }

  return dbResult;
};

export const checkUsername = async (username: any): Promise<boolean> => {
  if (IsInvalid.username(username)) {
    return false;
  }

  try {
    const stored = await knex<DBUsers>("users").where("id", username);

    if (stored.length !== 0) {
      return false;
    }
    return true;
  } catch (e) {
    renderError(e);
    return false;
  }
};

export const login = async (username: any, password: any): Promise<string> => {
  if (IsInvalid.username(username) || IsInvalid.password(password)) {
    return "";
  }

  try {
    const storedUserData = await knex<DBUsers>("users")
      .where("id", username)
      .then((stored) => {
        console.log(`user data in postgres: ${JSON.stringify(stored)}`);
        return stored;
      });

    if (storedUserData.length === 0) {
      console.log("user does NOT exist.");
      return "";
    }
    const expectedPassword = storedUserData[0].password;
    if (!expectedPassword || expectedPassword !== password) {
      return "";
    }

    const sessionID = await Sessions.add(username);

    console.log(`sessionID generated: ${sessionID}`);
    return sessionID;
  } catch (e) {
    renderError(e);
    return "";
  }
};
