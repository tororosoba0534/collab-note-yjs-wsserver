import { Sessions } from "../../auth/Sessions";
import { renderError } from "../../utils/errorHandlings";
import { IsNOTvalid } from "../../utils/validations";

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
