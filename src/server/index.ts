import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import setupWSConnection from "../websockets/setupWSConnection";
import { authOnUpgrade } from "../auth/authOnUpgrade";
import cors from "cors";
import config from "../config";
import { checkUsername, login, register } from "./rootFuncs";
import { Sessions } from "../auth/Sessions";
import {
  changePassword,
  changeUsername,
  checkAuth,
  deleteAccount,
  logout,
} from "./personalFuncs";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

app.use(
  cors({
    origin: config.front.ORIGIN, // アクセス許可するオリジン
    credentials: true, // レスポンスヘッダーにAccess-Control-Allow-Credentials追加
    optionsSuccessStatus: 200, // レスポンスstatusを200に設定
  })
);

app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// addAuthMiddlewares(app);
// addAccountMiddlewares(app);

wss.on("connection", async (conn, req) => {
  await setupWSConnection(conn, req);
});

server.on("upgrade", async (req, socket, head) => {
  console.log("upgrade detected.");
  console.log(`url: ${req.url}`);

  const result = await authOnUpgrade(req, socket);
  if (!result) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    console.log("authentication failed");
    return;
  }

  console.log("Session parsed!");
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

export default server;
