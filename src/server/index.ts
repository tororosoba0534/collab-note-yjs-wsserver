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
import { addRoutes } from "./addRoutes";

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

addRoutes(app);

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
