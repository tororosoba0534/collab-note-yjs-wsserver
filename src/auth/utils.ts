import { DB } from "../database/DB";
import { DBUsers } from "../database/dbTypes";
import { renderError } from "../utils/errorHandlings";
import { IsNOTvalid } from "../utils/validations";

export const isDocIDValid = async (docID: string): Promise<boolean> => {
  if (IsNOTvalid.userID(docID)) {
    return false;
  }

  try {
    const storedUsers = await DB.knex<DBUsers>("users").where("id", docID);

    if (storedUsers.length === 0) {
      return false;
    }

    return true;
  } catch (e) {
    renderError(e);
    return false;
  }
};
