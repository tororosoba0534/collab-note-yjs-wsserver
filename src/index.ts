import config from "./config";
import { DB } from "./database/DB";
import { REDIS } from "./redis/REDIS";
import server from "./server";

DB.init();

REDIS.init();

server.listen(config.server.PORT, () => {
  console.log("Listen on port: ", config.server.PORT);
});
