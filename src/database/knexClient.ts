import Knex from "knex";
import config from "../config";

const knexClient =
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

export default knexClient;
