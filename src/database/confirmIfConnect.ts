import knex from "./knex";

knex("items")
  .select("*")
  .then((result) => console.log(result));
