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
  // eslint-disable-next-line jest/expect-expect
  it("/test", async () => {
    // request(server).get("/test").expect(200, { hello: "Hello from server!" });

    const res = await request(server).get("/test");
    expect(res.statusCode).toBe(200);
    console.log(`res.body: ${JSON.stringify(res.body)}`);
    expect(res.body.hello).toBe("Hello from server!");
  });

  describe("/create-account", () => {
    it.each([
      ["testuser1", "passWord1", "passWord2", 200],
      ["testuser1", "passWord3", "passWord4", 409],
      ["testuser2", "passWord1", "passWord2", 200],
      ["testuser3", "passWord5", "passWord5", 400],
      ["test", "passWord1", "passWord2", 400],
      ["testuser3", "password", "passWord2", 400],
      ["testuser4", "passWord1", "passWord", 400],
    ])(
      "userID: %p, password: %p, adminPassword: %p, expect status code: %p",
      async (userID, password, adminPassword, result) => {
        const res = await request(server)
          .post("/create-account")
          .send({ userID, password, adminPassword });

        expect(res.statusCode).toBe(result);
      }
    );
  });

  describe("/check-userid", () => {
    it.each([
      ["testuser1", 409],
      ["newUser", 200],
      ["test", 400],
    ])("userID: %p, expected status code: %p", async (userID, result) => {
      const res = await request(server).post("/check-userid").send({ userID });

      expect(res.statusCode).toBe(result);
    });
  });

  const sessionIDArr: string[] = [];
  describe("/login", () => {
    it.each([
      ["testuser1", "passWord1", 200],
      ["testuser2", "passWord2", 401],
      ["testuser2", "passWord1", 200],
    ])(
      "userID: %p, password: %p, expected status code: %p",
      async (userID, password, resultStatus) => {
        const res = await request(server)
          .post("/login")
          .send({ userID, password });

        expect(res.statusCode).toBe(resultStatus);
        // expect(typeof res.body.sessionID).toBe("string");
        if (res.statusCode === 200) {
          sessionIDArr.push(res.body.sessionID);
        }
        console.log(`res.body.sessionID: ${res.body.sessionID}`);
      }
    );
    it("confirm sessionIDs existance", () => {
      expect(sessionIDArr.length).toBe(2);
    });
  });

  // describe("/personal/check-auth existing", () => {
  //   it.each([sessionIDArr[0], sessionIDArr[1]])(
  //     "sessionID: %p",
  //     async (sessionID) => {
  //       const res = await request(server)
  //         .post("/personal/check-auth")
  //         .send({ sessionID });

  //       expect(res.statusCode).toBe(200);
  //     }
  //   );
  // });
});
