import request from "supertest";
import { DB } from "../database/DB";
import server from "./index";
import { REDIS } from "../redis/REDIS";

beforeAll(async () => {
  await DB.beforeTest();
  await REDIS.beforeTest();
});

afterAll(async () => {
  await DB.afterTest();
  await REDIS.afterTest();
  server.close();
});

describe("server", () => {
  it("/test", () => {
    request(server).get("/test").expect(200, { hello: "Hello from server!" });
  });

  describe("/create-account", () => {
    it.each([["testuser", "passWord1", "passWord2", 200]])(
      "userID: %p, password: %p, adminPassword: %p, expect status code: %p",
      async (userID, password, adminPassword, result) => {
        const res = await request(server)
          .post("/create-account")
          .send({ userID, password, adminPassword });

        expect(res.statusCode).toBe(result);
      }
    );
  });
});
