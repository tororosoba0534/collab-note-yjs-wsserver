import cors from "cors";
import express, { Express } from "express";
import cookieParser from "cookie-parser";
import { checkAuthHandler, loginHandler, logoutHandler } from "./handlers";
import config from "../config";

const addAuthMiddlewares = (app: Express) => {
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
  app.use(cookieParser());

  app.get("/check-auth", checkAuthHandler);

  app.post("/login", loginHandler);

  app.get("/logout", logoutHandler);
};

export default addAuthMiddlewares;
