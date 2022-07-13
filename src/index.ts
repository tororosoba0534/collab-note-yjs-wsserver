import Knex from "knex";
import config from "./config";
import { DB } from "./database/DB";
import server from "./server";

DB.knex =
  config.NODE_ENV === "production"
    ? Knex({
        client: "pg",
        connection: {
          connectionString: config.db.CONNECTION_URI,
          ssl: { rejectUnauthorized: false },
        },
      })
    : Knex({
        client: "pg",
        connection: config.db.CONNECTION_URI,
      });

server.listen(config.server.PORT, () => {
  console.log("Listen on port: ", config.server.PORT);
});
