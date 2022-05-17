import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import addAuthMiddlewares from "./auth/addAuthMiddlewares";
import setupWSConnection from "./websockets/setupWSConnection";
import { parse as cookieParse } from "cookie";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

addAuthMiddlewares(app);

wss.on("connection", async (conn, req) => {
  await setupWSConnection(conn, req);
});

server.on("upgrade", (req, socket, head) => {
  console.log("upgrade detected.");
  console.log(`url: ${req.url}`);

  const sessionToken = cookieParse(req.headers.cookie || "")?.session_token;
  console.log(`sessionToken: ${sessionToken}`);
  if (!sessionToken) {
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
