import http from "http";
import { WebSocketServer } from "ws";
import setupWSConnection from "./setupWSConnection";
import { authOnUpgrade } from "../auth/authOnUpgrade";

const wss = new WebSocketServer({ noServer: true });
wss.on("connection", async (conn, req) => {
  await setupWSConnection(conn, req);
});

export const addWSEntrypoint = (server: http.Server) => {
  server.on("upgrade", async (req, socket, head) => {
    const result = await authOnUpgrade(req, socket);
    if (!result) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });
};
