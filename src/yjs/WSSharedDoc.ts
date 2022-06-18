import * as Y from "yjs";
import * as mutex from "lib0/mutex";
import * as awarenessProtocol from "y-protocols/awareness";
import * as syncProtocol from "y-protocols/sync";
import * as encoding from "lib0/encoding";
import { yjsConsts } from "./yjsConsts";
import { WebSocket } from "ws";
import { YjsWS } from "./YjsWS";
import { yjsPub, yjsSub } from "../redis/pubsub";
import { YjsDB } from "./YjsDB";

const updateHandler = async (
  update: Uint8Array,
  origin: any,
  doc: WSSharedDoc
): Promise<void> => {
  console.log("Y.Doc update detected!");
  let shouldPersist = false;

  if (origin instanceof WebSocket && doc.conns.has(origin)) {
    // @ts-ignore
    yjsPub.publishBuffer(doc.name, Buffer.from(update)); // do not await
    shouldPersist = true;
  }

  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, yjsConsts.MESSAGE_SYNC);
  syncProtocol.writeUpdate(encoder, update);
  const message = encoding.toUint8Array(encoder);
  doc.conns.forEach((_, conn) => YjsWS.send(doc, conn, message));

  if (shouldPersist) {
    await YjsDB.persistUpdate(doc, update);
  }
};

class WSSharedDoc extends Y.Doc {
  name: string;
  awarenessChannel: string;
  mux: mutex.mutex;
  conns: Map<WebSocket, Set<number>>;
  awareness: awarenessProtocol.Awareness;

  constructor(name: string) {
    super();

    this.name = name;
    this.awarenessChannel = `${name}-awareness`;
    this.mux = mutex.createMutex();
    this.conns = new Map();
    this.awareness = new awarenessProtocol.Awareness(this);

    const awarenessChangeHandler = (
      {
        added,
        updated,
        removed,
      }: { added: number[]; updated: number[]; removed: number[] },
      origin: any
    ) => {
      const changedClients = added.concat(updated, removed);
      const connControlledIds = this.conns.get(origin);
      if (connControlledIds) {
        added.forEach((clientId) => {
          connControlledIds.add(clientId);
        });
        removed.forEach((clientId) => {
          connControlledIds.delete(clientId);
        });
      }

      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, yjsConsts.MESSAGE_AWARENESS);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients)
      );
      const buff = encoding.toUint8Array(encoder);

      this.conns.forEach((_, c) => {
        YjsWS.send(this, c, buff);
      });
    };

    this.awareness.on("update", awarenessChangeHandler);
    this.on("update", updateHandler);

    yjsSub.subscribe(this.name, this.awarenessChannel).then(() => {
      yjsSub.on("messageBuffer", (channel, update) => {
        const channelId = channel.toString();

        // update is a Buffer, Buffer is a subclass of Uint8Array, update can be applied
        // as an update directly

        if (channelId === this.name) {
          Y.applyUpdate(this, update, yjsSub);
        } else if (channelId === this.awarenessChannel) {
          console.log("here");
          awarenessProtocol.applyAwarenessUpdate(
            this.awareness,
            update,
            yjsSub
          );
        }
      });
    });
  }

  destroy() {
    super.destroy();
    yjsSub.unsubscribe(this.name);
  }
}

export default WSSharedDoc;
