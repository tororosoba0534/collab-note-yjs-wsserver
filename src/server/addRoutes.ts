import { Express } from "express";
import { Sessions } from "../auth/Sessions";
import {
  changePassword,
  changeUsername,
  checkAuth,
  deleteAccount,
  logout,
} from "./personalFuncs";
import { checkUsername, login, register } from "./rootFuncs";

export const addRoutes = (app: Express): void => {
  app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    const result = await register(username, password);

    res.send(JSON.stringify({ registerStatus: result }));
    return;
  });

  app.post("/check-username", async (req, res) => {
    const { username } = req.body;
    const result = await checkUsername(username);
    res.send(JSON.stringify({ isValidName: result }));
    return;
  });

  app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const sessionID = await login(username, password);
    res.send(JSON.stringify({ sessionID }));
    return;
  });

  app.post("/personal/check-auth", async (req, res) => {
    const sessionID = Sessions.req2Token(req);
    const username = await checkAuth(sessionID);
    res.send(JSON.stringify({ username }));
  });

  app.post("/personal/logout", async (req, res) => {
    const sessionID = Sessions.req2Token(req);
    const logoutStatus = await logout(sessionID);
    res.send(JSON.stringify({ logoutStatus }));
  });

  app.post("/personal/delete-account", async (req, res) => {
    const sessionID = Sessions.req2Token(req);
    const deleteAccountStatus = await deleteAccount(sessionID);
    res.send(JSON.stringify({ deleteAccountStatus }));
  });

  app.post("/personal/change-username", async (req, res) => {
    const oldSessionID = Sessions.req2Token(req);
    const { newUsername } = req.body;
    const newSessionID = await changeUsername(oldSessionID, newUsername);
    res.send(JSON.stringify({ newSessionID }));
  });

  app.post("/personal/change-password", async (req, res) => {
    const oldSessionID = Sessions.req2Token(req);
    const { newPassword } = req.body;
    const newSessionID = await changePassword(oldSessionID, newPassword);
    res.send(JSON.stringify({ newSessionID }));
  });
};
