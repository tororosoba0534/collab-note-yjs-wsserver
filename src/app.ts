import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import addAuthMiddlewares from "./auth/addAuthMiddlewares";
import setupWSConnection from "./websockets/setupWSConnection";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

addAuthMiddlewares(app);

wss.on("connection", async (conn, req) => {
  await setupWSConnection(conn, req);
});

server.on("upgrade", (req, socket, head) => {
  // check auth
  console.log("upgrade detected.");
  console.log(`url: ${req.url}`);

  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

export default server;
