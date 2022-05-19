import { RequestHandler } from "express";
import { Session, sessionsStore } from "./sessions";
import { v4 as uuidv4 } from "uuid";
import knex from "../database/knex";
import { DBUsers } from "../database/dbTypes";

/*
login:
{
  username: string,
  password: string
} -> {
  authed: boolean,
  sessionID: string
}
*/
type LoginResData = {
  authed: boolean;
  sessionID: string;
};
export const loginHandler: RequestHandler = async (req, res) => {
  console.log("login detected.");

  // get users credentials from the JSON body
  const { username, password } = req.body;

  let resData: LoginResData;

  if (
    !username ||
    !password ||
    typeof username !== "string" ||
    typeof password !== "string"
  ) {
    resData = {
      authed: false,
      sessionID: "",
    };

    res.send(JSON.stringify(resData));
    return;
  }

  // validate the password against our data
  // if invalid, send an unauthorized code
  const stored = await knex<DBUsers>("users")
    .where("id", username)
    .then((stored) => {
      console.log(`user data in postgres: ${JSON.stringify(stored)}`);
      return stored;
    });

  if (stored.length === 0) {
    console.log("user does NOT exist.");
    resData = {
      sessionID: "",
      authed: false,
    };

    res.send(JSON.stringify(resData));
    return;
  }
  const expectedPassword = stored[0].password;
  if (!expectedPassword || expectedPassword !== password) {
    resData = {
      sessionID: "",
      authed: false,
    };

    res.send(JSON.stringify(resData));
    return;
  }

  // generate a random UUID as the session token
  const sessionID = uuidv4();

  // set the expiry time as 120s after the current time
  const now = new Date();
  const expiresAt = new Date(+now + 120 * 1000);

  // create a session containing information about the user and expiry time
  const session = new Session(username, expiresAt);

  console.log(`sessionID generated: ${sessionID}`);
  // add the session information to the sessions map
  sessionsStore.set(sessionID, session);

  resData = {
    sessionID,
    authed: true,
  };

  res.send(JSON.stringify(resData));
};

/*
check-auth:
{
  sessionID: string
} -> {
  authed: boolean
  username: string
}
*/
type checkAuthResData = {
  authed: boolean;
  username: string;
};

export const checkAuthHandler: RequestHandler = (req, res) => {
  const { sessionID } = req.body;
  let resData: checkAuthResData;
  // if this request doesn't have any cookies, that means it isn't
  // authenticated. Return an error code.
  console.log(`sessionID in req: ${sessionID}`);
  if (!sessionID) {
    resData = {
      username: "",
      authed: false,
    };
    res.send(JSON.stringify(resData));
    return;
  }

  // We then get the session of the user from our session map
  // that we set in the signinHandler
  const userSession = sessionsStore.get(sessionID);
  if (!userSession) {
    resData = {
      username: "",
      authed: false,
    };
    res.send(JSON.stringify(resData));
    return;
  }
  // if the session has expired, return an unauthorized error, and delete the
  // session from our map
  if (userSession.isExpired()) {
    sessionsStore.delete(sessionID);
    resData = {
      username: "",
      authed: false,
    };
    res.send(JSON.stringify(resData));
    return;
  }

  // If all checks have passed, we can consider the user authenticated and
  // send a welcome message
  resData = {
    username: userSession.username,
    authed: true,
  };
  res.send(JSON.stringify(resData));
};

/*
logout: {
  sessionID: string
} -> {
  logoutStatus: boolean
}
*/
type LogoutResData = {
  logoutStatus: boolean;
};

export const logoutHandler: RequestHandler = (req, res) => {
  let resData: LogoutResData;
  const { sessionID } = req.body;
  if (!sessionsStore.has(sessionID)) {
    resData = {
      logoutStatus: false,
    };
    res.send(JSON.stringify(resData));
  }
  sessionsStore.delete(sessionID);
  resData = {
    logoutStatus: true,
  };
  res.send(JSON.stringify(resData));
};
