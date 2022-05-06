// import app from "./app";
import { config } from "./config";

import express from "express";
import http from "http";
import { WebSocketServer } from "ws";

// app.listen(config.server.port, () => {
//   console.log(`Listen ${config.server.port}`);
// });

// import { WebSocketServer } from "ws";
// import { config } from "./config";

// const wss = new WebSocketServer({ port: config.server.port });

// wss.on("connection", function connection(ws) {
//   ws.on("message", function message(data) {
//     console.log("received: %s", data);
//     ws.send(JSON.stringify({ hey: "from ws server!" }));
//   });

//   ws.send("something");
// });

export const app = express();
export const server = http.createServer(app);
export const wss = new WebSocketServer({ noServer: true });

wss.on("connection", function connection(ws) {
  ws.on("message", function message(data) {
    console.log("received: %s", data);
    ws.send(JSON.stringify({ hey: "from ws server!" }));
  });

  ws.send("connection succeeded!");
});

server.on("upgrade", (req, socket, head) => {
  // check auth
  console.log("upgrade detected.");

  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

server.listen(config.server.port, () => {
  console.log("Listen on port: ", config.server.port);
});
