import WSSharedDoc from "./WSSharedDoc";
import { WebSocket } from "ws";
import constants from "./constants";
import * as awarenessProtocol from "y-protocols/awareness";
import docs from "./docs";

export const closeConn = (doc: WSSharedDoc, conn: WebSocket): void => {
  const controlledIds = doc.conns.get(conn);
  if (controlledIds) {
    doc.conns.delete(conn);
    awarenessProtocol.removeAwarenessStates(
      doc.awareness,
      Array.from(controlledIds),
      null
    );

    if (doc.conns.size === 0) {
      doc.destroy();
      docs.delete(doc.name);
    }
  }

  conn.close();
};

export const send = (
  doc: WSSharedDoc,
  conn: WebSocket,
  m: Uint8Array
): void => {
  if (
    conn.readyState !== constants.WS_READY_STATE_CONNECTING &&
    conn.readyState !== constants.WS_READY_STATE_OPEN
  ) {
    closeConn(doc, conn);
  }

  try {
    conn.send(m, (err) => {
      if (err) {
        closeConn(doc, conn);
      }
    });
  } catch (e) {
    closeConn(doc, conn);
  }
};
