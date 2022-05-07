import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import setupWSConnection from "./websockets/setupWSConnection";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

wss.on("connection", async (conn, req) => {
  await setupWSConnection(conn, req);
});

server.on("upgrade", (req, socket, head) => {
  // check auth
  console.log("upgrade detected.");

  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

export default server;
