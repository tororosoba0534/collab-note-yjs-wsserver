import request from "supertest";
import server from "./index";

describe("server", () => {
  it("/test", () => {
    request(server).get("/test").expect(200, { hello: "Hello from server!" });
  });
});
