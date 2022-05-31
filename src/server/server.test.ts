import request from "supertest";
import server from "./index";

test("server test", () => {
  request(server).get("/test").expect(200, { hello: "Hello from server!" });
});
