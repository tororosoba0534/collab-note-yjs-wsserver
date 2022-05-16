import { WebSocket, Data as WSData } from "ws";
import http from "http";
import { getYDoc } from "./docs";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import WSSharedDoc from "./WSSharedDoc";
import constants from "./constants";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import { pub } from "../redis/pubsub";
import { closeConn, send } from "./utils";
import { getUpdates } from "../database/utils";
import * as Y from "yjs";

const setupWSConnection = async (
  conn: WebSocket,
  req: http.IncomingMessage
) => {
  conn.binaryType = "arraybuffer";
  const docname = req.url?.slice(1).split("?")[0] as string;
  const [doc, isNew] = getYDoc(docname);
  doc.conns.set(conn, new Set());

  conn.on("message", (message: WSData) => {
    // console.log("received: %s", message);
    console.log("Message came from ", req.url);
    // console.log("docname: ", docname);
    messageListener(conn, req, doc, new Uint8Array(message as ArrayBuffer));
  });

  if (isNew) {
    const persistedUpdates = await getUpdates(doc);
    const dbYDoc = new Y.Doc();

    dbYDoc.transact(() => {
      for (const u of persistedUpdates) {
        Y.applyUpdate(dbYDoc, u.update);
      }
    });

    Y.applyUpdate(doc, Y.encodeStateAsUpdate(dbYDoc));
  }

  let pongReceived = true;
  const pingInterval = setInterval(() => {
    if (!pongReceived) {
      if (doc.conns.has(conn)) {
        closeConn(doc, conn);
      }
      clearInterval(pingInterval);
    } else if (doc.conns.has(conn)) {
      pongReceived = false;
      try {
        conn.ping();
      } catch (e) {
        closeConn(doc, conn);
        clearInterval(pingInterval);
      }
    }
  }, constants.PING_TIMEOUT);

  conn.on("close", () => {
    closeConn(doc, conn);
    clearInterval(pingInterval);
  });

  conn.on("pong", () => {
    pongReceived = true;
  });

  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, constants.MESSAGE_SYNC);
  syncProtocol.writeSyncStep1(encoder, doc);
  send(doc, conn, encoding.toUint8Array(encoder));
  const awarenessStates = doc.awareness.getStates();
  if (awarenessStates.size > 0) {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, constants.MESSAGE_AWARENESS);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(
        doc.awareness,
        Array.from(awarenessStates.keys())
      )
    );
    send(doc, conn, encoding.toUint8Array(encoder));
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
    case constants.MESSAGE_SYNC: {
      encoding.writeVarUint(encoder, constants.MESSAGE_SYNC);
      syncProtocol.readSyncMessage(decoder, encoder, doc, conn);

      if (encoding.length(encoder) > 1) {
        send(doc, conn, encoding.toUint8Array(encoder));
      }

      break;
    }
    case constants.MESSAGE_AWARENESS: {
      const update = decoding.readVarUint8Array(decoder);
      // @ts-ignore
      pub.publishBuffer(doc.awarenessChannel, Buffer.from(update));
      awarenessProtocol.applyAwarenessUpdate(doc.awareness, update, conn);
      break;
    }
    default:
      throw new Error("unreachable");
  }
};
