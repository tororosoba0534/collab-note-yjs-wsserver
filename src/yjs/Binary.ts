import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import { yjsConsts } from "./yjsConsts";
import WSSharedDoc from "./WSSharedDoc";
import { YjsWS } from "./YjsWS";
import { WebSocket } from "ws";
import { yjsPub } from "../redis/pubsub";

export class Binary {
  static syncUpdateMsg = (update: Uint8Array): Uint8Array => {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, yjsConsts.MESSAGE_SYNC);
    syncProtocol.writeUpdate(encoder, update);
    const message = encoding.toUint8Array(encoder);

    return message;
  };

  static syncStep1Msg = (doc: WSSharedDoc) => {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, yjsConsts.MESSAGE_SYNC);
    syncProtocol.writeSyncStep1(encoder, doc);
    const message = encoding.toUint8Array(encoder);

    return message;
  };

  static awarenessMsg = (
    awareness: awarenessProtocol.Awareness,
    clients: number[]
  ): Uint8Array => {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, yjsConsts.MESSAGE_AWARENESS);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(awareness, clients)
    );
    const awarenessMsg = encoding.toUint8Array(encoder);

    return awarenessMsg;
  };

  static notificationMsg = (
    type: "deleteAccount" | "changeUserID" | "changePassword" | "test"
  ): Uint8Array => {
    const messageType =
      type === "deleteAccount"
        ? 10
        : type === "changeUserID"
        ? 11
        : type === "changePassword"
        ? 12
        : 9;

    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageType);
    return encoding.toUint8Array(encoder);
  };

  static handleIncommingBinaryMsg = async (
    conn: WebSocket,
    // req: http.IncomingMessage,
    doc: WSSharedDoc,
    message: Uint8Array
  ): Promise<void> => {
    const encoder = encoding.createEncoder();
    const decoder = decoding.createDecoder(message);
    const messageType = decoding.readVarUint(decoder);
    switch (messageType) {
      case yjsConsts.MESSAGE_SYNC: {
        console.log("on message: sync");
        encoding.writeVarUint(encoder, yjsConsts.MESSAGE_SYNC);
        syncProtocol.readSyncMessage(decoder, encoder, doc, conn);

        if (encoding.length(encoder) > 1) {
          YjsWS.send(doc, conn, encoding.toUint8Array(encoder));
        }

        break;
      }
      case yjsConsts.MESSAGE_AWARENESS: {
        // console.log("on message: awareness");
        const update = decoding.readVarUint8Array(decoder);
        // @ts-ignore
        yjsPub.publishBuffer(doc.awarenessChannel, Buffer.from(update));
        awarenessProtocol.applyAwarenessUpdate(doc.awareness, update, conn);
        break;
      }
      case yjsConsts.MESSAGE_TEST: {
        YjsWS.broadcastNotification(doc.name, "test");
        break;
      }
      default:
        console.error("invalid message type.");
    }
  };
}
