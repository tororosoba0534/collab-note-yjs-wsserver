import { WebSocket, Data as WSData } from "ws";
import http from "http";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import WSSharedDoc from "./WSSharedDoc";
import { yjsConsts } from "./yjsConsts";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import { yjsPub } from "../redis/pubsub";
import { YjsWS } from "./YjsWS";

import { YDocsStore } from "./YDocsStore";

const setupWSConnection = async (
  conn: WebSocket,
  req: http.IncomingMessage
) => {
  conn.binaryType = "arraybuffer";
  const docname = req.url?.slice(1).split("?")[0].split("/")[1] as string;
  const doc = await YDocsStore.get(docname);
  doc.conns.set(conn, new Set());

  conn.on("message", (message: WSData) => {
    // console.log("received: %s", message);
    console.log("Message came from ", req.url);
    console.log("docname: ", docname);
    messageListener(conn, req, doc, new Uint8Array(message as ArrayBuffer));
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

  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, yjsConsts.MESSAGE_SYNC);
  syncProtocol.writeSyncStep1(encoder, doc);
  YjsWS.send(doc, conn, encoding.toUint8Array(encoder));
  const awarenessStates = doc.awareness.getStates();
  if (awarenessStates.size > 0) {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, yjsConsts.MESSAGE_AWARENESS);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(
        doc.awareness,
        Array.from(awarenessStates.keys())
      )
    );
    YjsWS.send(doc, conn, encoding.toUint8Array(encoder));
  }
};

export default setupWSConnection;

const messageListener = async (
  conn: WebSocket,
  req: http.IncomingMessage,
  doc: WSSharedDoc,
  message: Uint8Array
): Promise<void> => {
  // TODO: authenticate request
  const encoder = encoding.createEncoder();
  const decoder = decoding.createDecoder(message);
  const messageType = decoding.readVarUint(decoder);
  switch (messageType) {
    case yjsConsts.MESSAGE_SYNC: {
      encoding.writeVarUint(encoder, yjsConsts.MESSAGE_SYNC);
      syncProtocol.readSyncMessage(decoder, encoder, doc, conn);

      if (encoding.length(encoder) > 1) {
        YjsWS.send(doc, conn, encoding.toUint8Array(encoder));
      }

      break;
    }
    case yjsConsts.MESSAGE_AWARENESS: {
      const update = decoding.readVarUint8Array(decoder);
      // @ts-ignore
      yjsPub.publishBuffer(doc.awarenessChannel, Buffer.from(update));
      awarenessProtocol.applyAwarenessUpdate(doc.awareness, update, conn);
      break;
    }
    default:
      console.error("invalid message type.");
  }
};
