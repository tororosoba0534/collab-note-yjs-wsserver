import { Express } from "express";
import { Sessions } from "../auth/Sessions";
import {
  changePassword,
  changeUserID,
  checkAuth,
  deleteAccount,
  logout,
  checkUserID,
  login,
  createAccount,
} from "./handlers";

export const addRoutes = (app: Express): void => {
  app.get("/test", (req, res) => {
    res.send(JSON.stringify({ hello: "Hello from server!" }));
  });

  app.post("/create-account", async (req, res) => {
    console.log("create account called");

    const { userID, password } = req.body;
    const { status } = await createAccount(userID, password);

    res.sendStatus(status);
  });

  app.post("/check-userid", async (req, res) => {
    console.log("checkUserid called");

    const { userID } = req.body;
    const { status } = await checkUserID(userID);
    res.sendStatus(status);
  });

  app.post("/login", async (req, res) => {
    console.log("login called");

    const { userID, password } = req.body;
    const { status, sessionID } = await login(userID, password);
    res.status(status).send(JSON.stringify({ sessionID }));
  });

  app.post("/personal/check-auth", async (req, res) => {
    console.log("checkAuth called");

    const sessionID = Sessions.req2Token(req);
    const { status, userID } = await checkAuth(sessionID);
    res.status(status).send(JSON.stringify({ userID }));
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

  app.post("/personal/change-userid", async (req, res) => {
    console.log("changeUserid called");

    const oldSessionID = Sessions.req2Token(req);
    const { newUserID } = req.body;
    const { status, newSessionID } = await changeUserID(
      oldSessionID,
      newUserID
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
