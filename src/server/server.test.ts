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
      "userID: %p, password: %p, adminPassword: %p, expected status code: %p",
      async (userID, password, adminPassword, wantStatus) => {
        const res = await request(server)
          .post("/create-account")
          .send({ userID, password, adminPassword });

        expect(res.statusCode).toBe(wantStatus);
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

  const sessions: { [key: string]: string } = {};
  describe("/login", () => {
    it.each([
      ["testuser1", "passWord1", 200],
      ["testuser2", "passWord2", 401],
      ["testuser2", "passWord1", 200],
    ])(
      "userID: %p, password: %p, expected status code: %p",
      async (userID, password, wantStatus) => {
        const res = await request(server)
          .post("/login")
          .send({ userID, password });

        expect(res.statusCode).toBe(wantStatus);
        // expect(typeof res.body.sessionID).toBe("string");
        // if (res.statusCode === 200) {
        //   sessionIDArr.push(res.body.sessionID);
        //   console.log(`sessionIDArr: ${sessionIDArr}`);
        //   console.log(`sessionIDArr[0]: ${sessionIDArr[0]}`);
        //   console.log(`sessionIDArr[1]: ${sessionIDArr[1]}`);
        // }
        // console.log(`res.body.sessionID: ${res.body.sessionID}`);
        // sessionIDArr.push(res.body.sessionID);
        if (res.statusCode === 200) {
          sessions[userID] = res.body.sessionID;
        }
      }
    );
    // it("confirm sessionIDs existance", () => {
    //   expect(sessionIDArr.length).toBe(2);
    // });
  });

  describe("/personal/check-auth with valid sessionID", () => {
    it.each(["testuser1", "testuser2"])("sessionID: %p", async (userID) => {
      const sessionID = sessions[userID];
      const res = await request(server)
        .post("/personal/check-auth")
        .send({ sessionID });

      expect(res.statusCode).toBe(200);
      expect(res.body.userID).toBe(userID);
    });
  });

  describe("/personal/change-userid with valid sessionID", () => {
    it.each([
      ["testuser1", "testuser2", "passWord2", 409],
      ["testuser1", "testuser3", "passWord1", 403],
      ["testuser1", "test", "passWord2", 400],
      ["testuser1", "testuser3", "passWord2", 200],
      ["testuser3", "testuser1", "passWord2", 200],
    ])(
      "oldUserID: %p, newUserID: %p, adminPassword: %p, expected status code: %p",
      async (oldUserID, newUserID, adminPassword, wantStatus) => {
        const sessionID =
          oldUserID === "testuser3" ? sessions.testuser1 : sessions[oldUserID];
        const res = await request(server)
          .post("/personal/change-userid")
          .send({ newUserID, adminPassword, sessionID });

        expect(res.statusCode).toBe(wantStatus);
      }
    );
  });

  describe("/personal/change-password with valid sessionID", () => {
    it.each([
      ["testuser1", "password", "passWord2", 400],
      ["testuser1", "passWord3", "passWord4", 403],
      ["testuser1", "passWord2", "passWord2", 409],
      ["testuser1", "passWord3", "passWord2", 200],
    ])(
      "userID: %p, newPassword: %p, adminPassword: %p, expected status code: %p",
      async (userID, newPassword, adminPassword, wantStatus) => {
        const sessionID = sessions[userID];
        const res = await request(server)
          .post("/personal/change-password")
          .send({ sessionID, newPassword, adminPassword });

        expect(res.statusCode).toBe(wantStatus);
      }
    );
  });

  describe("/personal/change-admin-password with valid sessionID", () => {
    it.each([
      ["testuser1", "password", "passWord2", 400],
      ["testuser1", "passWord4", "passWord5", 403],
      ["testuser1", "passWord3", "passWord2", 409],
      ["testuser1", "passWord4", "passWord2", 200],
    ])(
      "userID: %p, newAdminPassword: %p, oldAdminPassword: %p, expected status code: %p",
      async (userID, newAdminPassword, oldAdminPassword, wantStatus) => {
        const sessionID = sessions[userID];
        const res = await request(server)
          .post("/personal/change-admin-password")
          .send({ sessionID, newAdminPassword, oldAdminPassword });

        expect(res.statusCode).toBe(wantStatus);
      }
    );
  });
  describe("/personal/delete-account with valid sessionID", () => {
    it.each([
      ["testuser1", "password", 403],
      ["testuser1", "passWord3", 403],
      ["testuser1", "passWord4", 200],
    ])(
      "userID: %p, adminPassword: %p, expected status code: %p",
      async (userID, adminPassword, wantStatus) => {
        const sessionID = sessions[userID];
        const res = await request(server)
          .post("/personal/delete-account")
          .send({ sessionID, adminPassword });

        expect(res.statusCode).toBe(wantStatus);
      }
    );
  });

  describe("/personal/logout", () => {
    it.each([
      ["testuser2", 200],
      ["testuser2", 401],
    ])("userID: %p, expected status code: %p", async (userID, wantStatus) => {
      const sessionID = sessions[userID];
      const res = await request(server)
        .post("/personal/logout")
        .send({ sessionID });

      expect(res.statusCode).toBe(wantStatus);
    });
  });

  describe("with INVALID sessionID", () => {
    it("/personal/check-auth", async () => {
      const sessionID = sessions.testuser2;
      const res = await request(server)
        .post("/personal/check-auth")
        .send({ sessionID });
      expect(res.statusCode).toBe(401);
    });

    it("/personal/change-userid", async () => {
      const sessionID = sessions.testuser2;
      const res = await request(server).post("/personal/change-userid").send({
        sessionID,
        newUserID: "testuser10",
        adminPassword: "passWord4",
      });
      expect(res.statusCode).toBe(401);
    });

    it("/personal/change-password", async () => {
      const sessionID = sessions.testuser2;
      const res = await request(server).post("/personal/change-password").send({
        sessionID,
        newPassword: "passWord10",
        adminPassword: "passWord4",
      });
      expect(res.statusCode).toBe(401);
    });

    it("/personal/change-admin-password", async () => {
      const sessionID = sessions.testuser2;
      const res = await request(server)
        .post("/personal/change-admin-password")
        .send({
          sessionID,
          newAdminPassword: "passWord10",
          oldAdminPassword: "passWord4",
        });
      expect(res.statusCode).toBe(401);
    });

    it("/personal/logout", async () => {
      const sessionID = sessions.testuser2;
      const res = await request(server)
        .post("/personal/logout")
        .send({ sessionID });
      expect(res.statusCode).toBe(401);
    });

    it("/personal/delete-account", async () => {
      const sessionID = sessions.testuser2;
      const res = await request(server)
        .post("/personal/delete-account")
        .send({ sessionID, adminPassword: "passWord4" });
      expect(res.statusCode).toBe(401);

      const confirmRes = await request(server)
        .post("/check-userid")
        .send({ userID: "testuser2" });
      expect(confirmRes.statusCode).toBe(409);
    });
  });
});
