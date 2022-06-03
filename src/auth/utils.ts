import { DBUsers } from "../database/dbTypes";
import knexClient from "../database/knexClient";
import { renderError } from "../utils/errorHandlings";
import { IsNOTvalid } from "../utils/validations";

export const isDocnameValid = async (docname: string): Promise<boolean> => {
  if (IsNOTvalid.username(docname)) {
    return false;
  }

  try {
    const storedUsers = await knexClient<DBUsers>("users").where("id", docname);

    if (storedUsers.length === 0) {
      console.log("docname does not exist.");
      return false;
    }

    console.log("docname exist.");
    return true;
  } catch (e) {
    renderError(e);
    return false;
  }
};
