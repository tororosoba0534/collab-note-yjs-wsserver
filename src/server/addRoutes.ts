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
  changeAdminPassword,
} from "./handlers";

export const addRoutes = (app: Express): void => {
  app.get("/test", (req, res) => {
    res
      .type("application/json")
      .send(JSON.stringify({ hello: "Hello from server!" }));
  });

  app.post("/create-account", async (req, res) => {
    const { userID, password, adminPassword } = req.body;
    const { status } = await createAccount(userID, password, adminPassword);

    res.sendStatus(status);
  });

  app.post("/check-userid", async (req, res) => {
    const { userID } = req.body;
    const { status } = await checkUserID(userID);
    res.sendStatus(status);
  });

  app.post("/login", async (req, res) => {
    const { userID, password } = req.body;
    const { status, sessionID } = await login(userID, password);
    const resSessionID = JSON.stringify({ sessionID });
    res.type("application/json").status(status).send(resSessionID);
  });

  app.post("/personal/check-auth", async (req, res) => {
    const sessionID = Sessions.req2Token(req);
    const { status, userID } = await checkAuth(sessionID);
    res
      .type("application/json")
      .status(status)
      .send(JSON.stringify({ userID }));
  });

  app.post("/personal/logout", async (req, res) => {
    const sessionID = Sessions.req2Token(req);
    const { status } = await logout(sessionID);
    res.sendStatus(status);
  });

  app.post("/personal/delete-account", async (req, res) => {
    const sessionID = Sessions.req2Token(req);
    const { adminPassword } = req.body;
    const { status } = await deleteAccount(sessionID, adminPassword);
    res.sendStatus(status);
  });

  app.post("/personal/change-userid", async (req, res) => {
    const sessionID = Sessions.req2Token(req);
    const { newUserID, adminPassword } = req.body;
    const { status } = await changeUserID(sessionID, adminPassword, newUserID);
    res.sendStatus(status);
  });

  app.post("/personal/change-password", async (req, res) => {
    const sessionID = Sessions.req2Token(req);
    const { newPassword, adminPassword } = req.body;
    const { status } = await changePassword(
      sessionID,
      adminPassword,
      newPassword
    );
    res.sendStatus(status);
  });

  app.post("/personal/change-admin-password", async (req, res) => {
    const sessionID = Sessions.req2Token(req);
    const { newAdminPassword, oldAdminPassword } = req.body;
    const { status } = await changeAdminPassword(
      sessionID,
      oldAdminPassword,
      newAdminPassword
    );
    res.sendStatus(status);
  });
};
