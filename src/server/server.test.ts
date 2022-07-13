import request from "supertest";
import { DB } from "../database/DB";
import server from "./index";
import Knex from "knex";
import config from "../config";

beforeAll(async () => {
  DB.knex = Knex({
    client: "pg",
    connection: config.db.CONNECTION_URI,
  });
});

afterAll(() => {
  DB.knex.destroy();
});

describe("server", () => {
  it("/test", () => {
    request(server).get("/test").expect(200, { hello: "Hello from server!" });
  });
});
