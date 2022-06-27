import WSSharedDoc from "./WSSharedDoc";
import { WebSocket } from "ws";
import { yjsConsts } from "./yjsConsts";
import * as awarenessProtocol from "y-protocols/awareness";
import { YDocsStore } from "./YDocsStore";
import { Binary } from "./Binary";

export class YjsWS {
  static closeConn = (doc: WSSharedDoc, conn: WebSocket): void => {
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
        YDocsStore.delete(doc.name);
      }
    }

    conn.close();
  };

  static send = (doc: WSSharedDoc, conn: WebSocket, m: Uint8Array): void => {
    if (
      conn.readyState !== yjsConsts.WS_READY_STATE_CONNECTING &&
      conn.readyState !== yjsConsts.WS_READY_STATE_OPEN
    ) {
      this.closeConn(doc, conn);
    }

    try {
      conn.send(m, (err) => {
        if (err) {
          this.closeConn(doc, conn);
        }
      });
    } catch (e) {
      this.closeConn(doc, conn);
    }
  };

  static closeAll = (docname: string) => {
    const doc = YDocsStore.get(docname);
    if (!doc) return false;

    const conns = doc.conns.keys();
    for (const conn of conns) {
      this.closeConn(doc, conn);
    }

    return true;
  };

  static broadcastNotification = (
    docname: string,
    type: "deleteAccount" | "changeUserID" | "changePassword" | "test"
  ): boolean => {
    const doc = YDocsStore.get(docname);
    if (!doc) return false;

    const conns = doc.conns.keys();
    const message = Binary.notificationMsg(type);
    for (const conn of conns) {
      this.send(doc, conn, message);
    }

    return true;
  };
}
