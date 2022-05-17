import { RequestHandler } from "express";
import { Session, usersStore, sessionsStore } from "./sessions";
import { v4 as uuidv4 } from "uuid";

type AuthDataType = {
  username: string | null;
  authed: boolean;
};

export const loginHandler: RequestHandler = (req, res) => {
  console.log("login detected.");

  // get users credentials from the JSON body
  const { username, password } = req.body;
  let authData: AuthDataType;

  if (!username) {
    authData = {
      username: null,
      authed: false,
    };

    res.send(JSON.stringify(authData));
    return;
  }

  // validate the password against our data
  // if invalid, send an unauthorized code
  const expectedPassword = usersStore.get(username);
  if (!expectedPassword || expectedPassword !== password) {
    authData = {
      username: null,
      authed: false,
    };

    res.send(JSON.stringify(authData));
    return;
  }

  // generate a random UUID as the session token
  const sessionToken = uuidv4();

  // set the expiry time as 120s after the current time
  const now = new Date();
  const expiresAt = new Date(+now + 120 * 1000);

  // create a session containing information about the user and expiry time
  const session = new Session(username, expiresAt);

  console.log(`session_token generated: ${sessionToken}`);
  // add the session information to the sessions map
  sessionsStore.set(sessionToken, session);

  // In the response, set a cookie on the client with the name "session_cookie"
  // and the value as the UUID we generated. We also set the expiry time
  res.cookie("session_token", sessionToken, { expires: expiresAt });
  authData = {
    username,
    authed: true,
  };

  res.send(JSON.stringify(authData));
};

export const checkAuthHandler: RequestHandler = (req, res) => {
  let authData: AuthDataType;
  // if this request doesn't have any cookies, that means it isn't
  // authenticated. Return an error code.
  if (!req.cookies) {
    authData = {
      username: null,
      authed: false,
    };
    res.send(JSON.stringify(authData));
    return;
  }

  // We can obtain the session token from the requests cookies, which come with every request
  const sessionToken = req.cookies.session_token;
  console.log(`session_token in cookie: ${sessionToken}`);
  if (!sessionToken) {
    // If the cookie is not set, return an unauthorized status
    authData = {
      username: null,
      authed: false,
    };
    res.send(JSON.stringify(authData));
    return;
  }

  // We then get the session of the user from our session map
  // that we set in the signinHandler
  const userSession = sessionsStore.get(sessionToken);
  if (!userSession) {
    authData = {
      username: null,
      authed: false,
    };
    res.send(JSON.stringify(authData));
    return;
  }
  // if the session has expired, return an unauthorized error, and delete the
  // session from our map
  if (userSession.isExpired()) {
    sessionsStore.delete(sessionToken);
    authData = {
      username: null,
      authed: false,
    };
    res.send(JSON.stringify(authData));
    return;
  }

  // If all checks have passed, we can consider the user authenticated and
  // send a welcome message
  authData = {
    username: userSession.username,
    authed: true,
  };
  res.send(JSON.stringify(authData));
};

export const logoutHandler: RequestHandler = (req, res) => {
  const sessionToken = req.cookies.session_token;
  sessionsStore.delete(sessionToken);
  res.sendStatus(200); // OK
};
