import knexClient from "./knexClient";

knexClient("items")
  .select("*")
  .then((result) => console.log(result));
