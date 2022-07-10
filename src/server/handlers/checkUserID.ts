import { DBUsers } from "../../database/dbTypes";
import knexClient from "../../database/knexClient";
import { renderError } from "../../utils/errorHandlings";
import { IsNOTvalid } from "../../utils/validations";

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
