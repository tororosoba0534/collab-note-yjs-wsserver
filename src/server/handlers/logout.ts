import { Sessions } from "../../auth/Sessions";
import { IsNOTvalid } from "../../utils/validations";

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

    const result = await Sessions.deleteBySessionID(sessionID);
    if (!result) {
      return { status: 500 };
    }
    return { status: 200 };
  } catch (e) {
    return { status: 500 };
  }
};
