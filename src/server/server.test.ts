import request from "supertest";
import server from "./index";

request(server).get("/test").expect(200, { hello: "Hello from server!" });
