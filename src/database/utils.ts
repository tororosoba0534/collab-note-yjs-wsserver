import constants from "../websockets/constants";
import WSSharedDoc from "../websockets/WSSharedDoc";
import knexClient from "./knexClient";
import * as Y from "yjs";
import dbConstants from "./constatns";

interface DBUpdate {
  id: string;
  user_id: string;
  update: Uint8Array;
}

export const getUpdates = async (doc: WSSharedDoc): Promise<DBUpdate[]> => {
  return knexClient.transaction(async (trx) => {
    const updates = await knexClient<DBUpdate>("yjs_updates")
      .transacting(trx)
      .where("user_id", doc.name)
      .forUpdate()
      .orderBy("id");

    if (updates.length >= constants.UPDATES_LIMIT) {
      const dbYDoc = new Y.Doc();

      dbYDoc.transact(() => {
        for (const u of updates) {
          Y.applyUpdate(dbYDoc, u.update);
        }
      });

      const [mergedUpdates] = await Promise.all([
        knexClient<DBUpdate>(dbConstants.YJS_UPDATES)
          .transacting(trx)
          .insert({ user_id: doc.name, update: Y.encodeStateAsUpdate(dbYDoc) })
          .returning("*"),
        knexClient("yjs_updates")
          .transacting(trx)
          .where("user_id", doc.name)
          .whereIn(
            "id",
            updates.map(({ id }) => id)
          )
          .delete(),
      ]);

      return mergedUpdates;
    } else {
      return updates;
    }
  });
};
