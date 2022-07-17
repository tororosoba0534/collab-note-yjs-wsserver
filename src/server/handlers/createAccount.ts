import { DB } from "../../database/DB";
import { DBUsers } from "../../database/dbTypes";
import { renderError } from "../../utils/errorHandlings";
import { hashPassword } from "../../utils/hashPassword";
import { IsNOTvalid } from "../../utils/validations";
import { makeInitContent } from "../../yjs/prosemirror";
import { YjsDB } from "../../yjs/YjsDB";

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

    dbResult = await DB.knex.transaction(async (trx) => {
      const stored = await trx<DBUsers>("users")
        .where("id", userID)
        .forUpdate();
      if (stored.length !== 0) {
        return { status: 409 };
      }

      await trx<DBUsers>("users").insert({
        id: userID,
        hash,
        admin_hash: adminHash,
      });

      return { status: 200 };
    });

    await YjsDB.persistUpdate(userID, makeInitContent());
  } catch (e) {
    renderError(e);
    dbResult = { status: 500 };
  }

  return dbResult;
};
