import { Knex } from "knex";

class DBClass {
  private knexClient: Knex<any, unknown[]> | null;
  constructor() {
    this.knexClient = null;
  }

  get knex(): Knex<any, unknown[]> {
    if (!this.knexClient)
      throw new Error("knex client does NOT exist in DB instance.");
    return this.knexClient;
  }

  set knex(newClient: Knex<any, unknown[]>) {
    this.knexClient = newClient;
  }
}

export const DB = new DBClass();
