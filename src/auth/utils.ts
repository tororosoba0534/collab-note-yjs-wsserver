import { DBUsers } from "../database/dbTypes";
import knexClient from "../database/knexClient";
import { renderError } from "../utils/errorHandlings";
import { IsNOTvalid } from "../utils/validations";

export const isDocIDValid = async (docID: string): Promise<boolean> => {
  if (IsNOTvalid.userID(docID)) {
    return false;
  }

  try {
    const storedUsers = await knexClient<DBUsers>("users").where("id", docID);

    if (storedUsers.length === 0) {
      console.log("docID does not exist.");
      return false;
    }

    console.log("docID exist.");
    return true;
  } catch (e) {
    renderError(e);
    return false;
  }
};
