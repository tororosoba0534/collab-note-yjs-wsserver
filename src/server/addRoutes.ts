import { Express } from "express";
import { Sessions } from "../auth/Sessions";
import {
  changePassword,
  changeUsername,
  checkAuth,
  deleteAccount,
  logout,
  checkUsername,
  login,
  createAccount,
} from "./handlers";

export const addRoutes = (app: Express): void => {
  app.get("/test", (req, res) => {
    res.send(JSON.stringify({ hello: "Hello from server!" }));
  });

  app.post("/createAccount", async (req, res) => {
    console.log("create account called");

    const { username, password } = req.body;
    const { status } = await createAccount(username, password);

    res.sendStatus(status);
  });

  app.post("/check-username", async (req, res) => {
    console.log("checkUsername called");

    const { username } = req.body;
    const { status, isUnused } = await checkUsername(username);
    res.status(status).send(JSON.stringify({ isUnused }));
  });

  app.post("/login", async (req, res) => {
    console.log("login called");

    const { username, password } = req.body;
    const { status, sessionID } = await login(username, password);
    res.status(status).send(JSON.stringify({ sessionID }));
  });

  app.post("/personal/check-auth", async (req, res) => {
    console.log("checkAuth called");

    const sessionID = Sessions.req2Token(req);
    const { status, username } = await checkAuth(sessionID);
    res.status(status).send(JSON.stringify({ username }));
  });

  app.post("/personal/logout", async (req, res) => {
    console.log("logout called");

    const sessionID = Sessions.req2Token(req);
    const { status } = await logout(sessionID);
    res.sendStatus(status);
  });

  app.post("/personal/delete-account", async (req, res) => {
    console.log("deleteAccount called");

    const sessionID = Sessions.req2Token(req);
    const { status } = await deleteAccount(sessionID);
    res.sendStatus(status);
  });

  app.post("/personal/change-username", async (req, res) => {
    console.log("changeUsername called");

    const oldSessionID = Sessions.req2Token(req);
    const { newUsername } = req.body;
    const { status, newSessionID } = await changeUsername(
      oldSessionID,
      newUsername
    );
    res.status(status).send(JSON.stringify({ newSessionID }));
  });

  app.post("/personal/change-password", async (req, res) => {
    console.log("changePassword called");

    const oldSessionID = Sessions.req2Token(req);
    const { newPassword } = req.body;
    const { staus, newSessionID } = await changePassword(
      oldSessionID,
      newPassword
    );
    res.sendStatus(staus).send(JSON.stringify({ newSessionID }));
  });
};
