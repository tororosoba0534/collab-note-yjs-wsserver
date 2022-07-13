import { Sessions } from "../../auth/Sessions";
import { DB } from "../../database/DB";
import { DBUsers } from "../../database/dbTypes";
import { renderError } from "../../utils/errorHandlings";
import { isNotSameHash } from "../../utils/hashPassword";
import { IsNOTvalid } from "../../utils/validations";

type ResultLogin = {
  status: 200 | 400 | 401 | 500;
  sessionID: string;
};
export const login = async (
  userID: any,
  password: any
): Promise<ResultLogin> => {
  if (IsNOTvalid.userID(userID) || IsNOTvalid.password(password)) {
    return { status: 400, sessionID: "" };
  }

  try {
    const storedUserData = await DB.knex<DBUsers>("users")
      .where("id", userID)
      .then((stored) => {
        console.log(`user data in postgres: ${JSON.stringify(stored)}`);
        return stored;
      });

    if (storedUserData.length === 0) {
      console.log("user does NOT exist.");
      return { status: 401, sessionID: "" };
    }
    const storedHash = storedUserData[0].hash;
    if (!storedHash) {
      return { status: 401, sessionID: "" };
    }

    // const hash = hashPassword(password);
    // console.log(`submit hash: ${hash}`);
    if (isNotSameHash(password, storedHash)) {
      return { status: 401, sessionID: "" };
    }

    const sessionID = await Sessions.add(userID);

    console.log(`sessionID generated: ${sessionID}`);
    return { status: 200, sessionID };
  } catch (e) {
    renderError(e);
    return { status: 500, sessionID: "" };
  }
};
