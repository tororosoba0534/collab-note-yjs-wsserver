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
};
