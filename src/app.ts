import express from "express";
import path from "path";
import { config } from "./config";

export const app = express();

app.use(express.static(config.server.craFilePath));

app.get("/", (_req, res) => {
  res.sendFile(path.resolve(config.server.craFilePath, "index.html"));
});

app.get("/api", (_req, res) => {
  res.set("Content-Type", "application/json");
  res.send('{"message":"Hello from the custom server!"}');
});

export default app;
