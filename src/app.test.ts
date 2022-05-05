import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import app from "./app";

describe("APIs", () => {
  test("Get text", async () => {
    return request(app)
      .get("/api")
      .then((res) => {
        expect(res.status).toEqual(200);
      });
  });
});
