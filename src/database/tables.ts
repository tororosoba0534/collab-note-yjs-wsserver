import knex from "./knex";

export const create = async () => {
  if (!(await knex.schema.hasTable("items"))) {
    await knex.schema.createTable("items", (t) => {
      t.bigIncrements("id");
      t.text("docname").index();
      t.binary("update");
    });
  }
};

export const drop = async () => {
  if (await knex.schema.hasTable("items")) {
    await knex.schema.dropTable("items");
  }
};

create()
  .then(() => console.log("table created"))
  .then(() => knex.destroy());
