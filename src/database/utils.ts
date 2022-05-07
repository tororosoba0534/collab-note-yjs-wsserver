import constants from "../websockets/constants";
import WSSharedDoc from "../websockets/WSSharedDoc";
import knex from "./knex";
import * as Y from "yjs";

interface DBUpdate {
  id: string;
  docname: string;
  update: Uint8Array;
}

export const getUpdates = async (doc: WSSharedDoc): Promise<DBUpdate[]> => {
  return knex.transaction(async (trx) => {
    const updates = await knex<DBUpdate>("items")
      .transacting(trx)
      .where("docname", doc.name)
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
        knex<DBUpdate>("items")
          .transacting(trx)
          .insert({ docname: doc.name, update: Y.encodeStateAsUpdate(dbYDoc) })
          .returning("*"),
        knex("items")
          .transacting(trx)
          .where("docname", doc.name)
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
