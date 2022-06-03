import Redis from "ioredis";
import config from "../config";
import { v4 as uuidv4 } from "uuid";
import { Sessions } from "./Sessions";
import { _privateRedis4Sessions } from "../redis/session";

beforeAll(async () => {
  const status = _privateRedis4Sessions.status;
  if (status === "close" || status === "end") {
    await _privateRedis4Sessions.connect();
  }
  await _privateRedis4Sessions.flushall();
});

afterAll(async () => {
  await _privateRedis4Sessions.flushall();
  await _privateRedis4Sessions.quit();
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
