import { WebSocket, Data as WSData } from "ws";
import http from "http";
import { yjsConsts } from "./yjsConsts";
import { YjsWS } from "./YjsWS";

import { YDocsStore } from "./YDocsStore";
import { Binary } from "./Binary";

const setupWSConnection = async (
  conn: WebSocket,
  req: http.IncomingMessage
) => {
  conn.binaryType = "arraybuffer";
  const docname = req.url?.slice(1).split("?")[0].split("/")[1] as string;

  const doc = await YDocsStore.getOrCreate(docname);

  doc.conns.set(conn, new Set());

  conn.on("message", (message: WSData) => {
    // console.log("Message came from ", req.url);
    Binary.handleIncommingBinaryMsg(
      conn,
      doc,
      new Uint8Array(message as ArrayBuffer)
    );
  });

  let pongReceived = true;
  const pingInterval = setInterval(() => {
    if (!pongReceived) {
      if (doc.conns.has(conn)) {
        YjsWS.closeConn(doc, conn);
      }
      clearInterval(pingInterval);
    } else if (doc.conns.has(conn)) {
      pongReceived = false;
      try {
        conn.ping();
      } catch (e) {
        YjsWS.closeConn(doc, conn);
        clearInterval(pingInterval);
      }
    }
  }, yjsConsts.PING_TIMEOUT);

  conn.on("close", () => {
    YjsWS.closeConn(doc, conn);
    clearInterval(pingInterval);
  });

  conn.on("pong", () => {
    pongReceived = true;
  });

  YjsWS.send(doc, conn, Binary.syncStep1Msg(doc));

  const awarenessStates = doc.awareness.getStates();
  if (awarenessStates.size > 0) {
    const awarenessMsg = Binary.awarenessMsg(
      doc.awareness,
      Array.from(awarenessStates.keys())
    );

    YjsWS.send(doc, conn, awarenessMsg);
  }
};

export default setupWSConnection;
