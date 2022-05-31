import express from "express";
import cors from "cors";
import config from "../config";
import { addRoutes } from "./addRoutes";
import http from "http";
import { addWSEntrypoint } from "../websockets";

const app = express();

app.use(
  cors({
    origin: config.front.ORIGIN, // アクセス許可するオリジン
    credentials: true, // レスポンスヘッダーにAccess-Control-Allow-Credentials追加
    optionsSuccessStatus: 200, // レスポンスstatusを200に設定
  })
);

app.set("trust proxy", 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

addRoutes(app);

const server = http.createServer(app);

addWSEntrypoint(server);

export default server;
