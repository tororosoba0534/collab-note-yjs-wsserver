import Knex, { Knex as KnexType } from "knex";
import config from "../config";
import { DBUsers } from "./dbTypes";

class DBClass {
  private _knex: KnexType<any, unknown[]> | null;
  constructor() {
    this._knex = null;
  }

  get knex(): KnexType<any, unknown[]> {
    if (!this._knex)
      throw new Error("knex client does NOT exist in DB instance.");
    return this._knex;
  }

  init = () => {
    this._knex =
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
  };

  beforeTest = () => {
    DB.init();
    DB.knex<DBUsers>("users").delete();
  };

  afterTest = () => {
    DB.knex.destroy();
  };
}

export const DB = new DBClass();
