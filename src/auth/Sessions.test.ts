import Redis from "ioredis";
import config from "../config";
import { v4 as uuidv4 } from "uuid";
import { Sessions } from "./Sessions";
import { TestRedisSession } from "../__tests__/testUtils";

beforeAll(async () => {
  await TestRedisSession.before();
});

afterAll(async () => {
  await TestRedisSession.after();
});

describe("Sessions class methods", () => {
  describe("Sad paths", () => {
    describe("Sessions.token2Username", () => {
      it("empty string", async () => {
        const result = await Sessions.token2Username("");
        expect(result).toBe("");
      });

      it("non-existing sessionID", async () => {
        const token = uuidv4();
        const result = await Sessions.token2Username("");
        expect(result).toBe("");
      });
    });

    describe("Sessions.add", () => {
      it("invalid username", async () => {
        const result = await Sessions.add("test");
        expect(result).toBe("");
      });
    });

    describe("Sessions.delete", () => {
      it("invalid sessionID", async () => {
        const result = await Sessions.delete("");
        expect(result).toBe(false);
      });
    });
  });

  describe("add & delete sessions", () => {
    it("Happy path", async () => {
      const username = "testuser";

      const sessionID = await Sessions.add(username);
      const storedUsername = await Sessions.token2Username(sessionID);
      expect(storedUsername).toBe(username);

      const deleteResult = await Sessions.delete(sessionID);
      expect(deleteResult).toBe(true);

      const deletedUser = await Sessions.token2Username(sessionID);
      expect(deletedUser).toBe("");
    });
  });
});
