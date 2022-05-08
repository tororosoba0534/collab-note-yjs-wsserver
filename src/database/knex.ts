import Knex from "knex";
import config from "../config";

const knex = Knex({
  client: "pg",
  // connection: {
  //   host: config.db.host,
  //   port: config.db.port,
  //   user: config.db.user,
  //   password: config.db.password,
  //   database: config.db.name,
  // },
  connection: {
    connectionString: config.db.connectionURI,
    ssl: { rejectUnauthorized: false },
  },
});

export default knex;
