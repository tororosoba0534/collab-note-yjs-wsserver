import request from "supertest";
import { DB } from "../database/DB";
import server from "./index";
import { REDIS } from "../redis/REDIS";

beforeAll(async () => {
  DB.beforeTest();
  REDIS.beforeTest();
});

afterAll(() => {
  DB.afterTest();
  REDIS.afterTest();
});

describe("server", () => {
  it("/test", () => {
    request(server).get("/test").expect(200, { hello: "Hello from server!" });
  });
});
