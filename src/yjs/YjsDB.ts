import { yjsConsts } from "./yjsConsts";
import WSSharedDoc from "./WSSharedDoc";
import * as Y from "yjs";
import { DB } from "../database/DB";

interface DBUpdate {
  id: string;
  user_id: string;
  update: Uint8Array;
}

export class YjsDB {
  static getUpdates = async (doc: WSSharedDoc): Promise<DBUpdate[]> => {
    return DB.knex.transaction(async (trx) => {
      const updates = await DB.knex<DBUpdate>("yjs_updates")
        .transacting(trx)
        .where("user_id", doc.name)
        .forUpdate()
        .orderBy("id");

      if (updates.length >= yjsConsts.UPDATES_LIMIT) {
        const dbYDoc = new Y.Doc();

        dbYDoc.transact(() => {
          for (const u of updates) {
            Y.applyUpdate(dbYDoc, u.update);
          }
        });

        const mergedUpdates = await DB.knex<DBUpdate>("yjs_updates")
          .transacting(trx)
          .insert({
            user_id: doc.name,
            update: Y.encodeStateAsUpdate(dbYDoc),
          })
          .returning("*");

        await DB.knex("yjs_updates")
          .transacting(trx)
          .where("user_id", doc.name)
          .whereIn(
            "id",
            updates.map(({ id }) => id)
          )
          .delete();

        // mergedUpdates.forEach((update, index) => {
        //   console.log(`mergedUpdates[${index}]: ${JSON.stringify(update)}`);
        // });

        return mergedUpdates;
      } else {
        return updates;
      }
    });
  };

  static persistUpdate = async (
    docname: string,
    update: Uint8Array
  ): Promise<void> => {
    // console.log(`persisted update: ${update}`);

    await DB.knex("yjs_updates").insert({ user_id: docname, update });
  };
}
