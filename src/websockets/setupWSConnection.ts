import { WebSocket } from "ws";
import http from "http";

const setupWSConnection = (conn: WebSocket, req: http.IncomingMessage) => {
  conn.binaryType = "arraybuffer";
  const docname = req.url?.slice(1).split("?")[0] as string;

  conn.on("message", function message(data) {
    console.log("received: %s", data);
    console.log("from ", req.url);
    console.log("docname: ", docname);
  });
};

export default setupWSConnection;
