import * as Y from "yjs";
import * as mutex from "lib0/mutex";
import * as awarenessProtocol from "y-protocols/awareness";
import { WebSocket } from "ws";
import { YjsWS } from "./YjsWS";
import { yjsPub, yjsSub } from "../redis/pubsub";
import { YjsDB } from "./YjsDB";
import { Binary } from "./Binary";

const updateHandler = async (
  update: Uint8Array,
  origin: any,
  doc: WSSharedDoc
): Promise<void> => {
  console.log("Y.Doc updateHandler called!");
  let shouldPersist = false;

  if (origin instanceof WebSocket && doc.conns.has(origin)) {
    // console.log("pub of sync called.");

    // @ts-ignore
    yjsPub.publishBuffer(doc.name, Buffer.from(update)); // do not await
    shouldPersist = true;
  }

  const syncMsg = Binary.syncUpdateMsg(update);
  doc.conns.forEach((_, conn) => YjsWS.send(doc, conn, syncMsg));

  if (shouldPersist) {
    // console.log("PERSIST");
    await YjsDB.persistUpdate(doc.name, update);
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
      // console.log("awareness update handler runnning!");
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

      const awarenessMsg = Binary.awarenessMsg(this.awareness, changedClients);

      this.conns.forEach((_, c) => {
        YjsWS.send(this, c, awarenessMsg);
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
          console.log("sub of sync");

          Y.applyUpdate(this, update, yjsSub);
        } else if (channelId === this.awarenessChannel) {
          // console.log("here: awareness via pub-sub");
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
