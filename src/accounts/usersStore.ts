import { DBUsers } from "../database/dbTypes";
import knex from "../database/knex";

class usersStore {
  static async getPassword(username: string) {
    const stored = await knex<DBUsers>("users").where("id", username);
    return stored[0].password;
  }
}

export default usersStore;
