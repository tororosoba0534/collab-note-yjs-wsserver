import config from "./config";
import { DB } from "./database/DB";
import { DBSessions } from "./database/dbTypes";
import { REDIS } from "./redis/REDIS";
import server from "./server";
import { error2String } from "./utils/errorHandlings";

DB.init();

REDIS.init();

setInterval(async () => {
  try {
    const date = new Date();
    const nowTime = Math.floor(date.getTime() / 1000);
    await DB.knex<DBSessions>("sessions")
      .where("expire_at", "<", nowTime)
      .delete();
  } catch (e) {
    console.error(error2String(e));
  }
}, config.SESSION_EXPIRATION_TIME * 1000);

server.listen(config.server.PORT, () => {
  console.log("Listen on port: ", config.server.PORT);
});
