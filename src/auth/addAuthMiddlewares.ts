import cors from "cors";
import express, { Express } from "express";
import session from "express-session";
import config from "../config";

declare module "express-session" {
  // eslint-disable-next-line no-unused-vars
  interface SessionData {
    user: string;
  }
}

const addAuthMiddlewares = (app: Express) => {
  app.use(
    cors({
      origin: config.front.ORIGIN, // アクセス許可するオリジン
      credentials: true, // レスポンスヘッダーにAccess-Control-Allow-Credentials追加
      optionsSuccessStatus: 200, // レスポンスstatusを200に設定
    })
  );

  app.set("trust proxy", 1);
  app.use(
    session({
      secret: "s3Cur3",
      resave: false,
      saveUninitialized: true,
      cookie: {
        path: "/", // default
        httpOnly: true, // default
        maxAge: 5 * 60 * 1000, // sec
        secure: false,
      },
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  type AuthDataType = {
    user: string;
    authed: boolean;
  };

  app.get("/check-auth", (req, res) => {
    console.log("/check-auth reached");
    console.log(`req.sessinID: ${req.sessionID}`);
    console.log(`req.session.user: ${req.session.user}`);
    let authData: AuthDataType;

    if (!req.session.user) {
      authData = {
        user: "",
        authed: false,
      };
    } else {
      authData = {
        user: req.session.user,
        authed: true,
      };
    }

    // authData = {
    //   user: "test",
    //   authed: true,
    // };

    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(authData));
  });

  app.post("/login", (req, res) => {
    let authData: AuthDataType;
    console.log(`req.body?.user: ${req.body?.user}`);
    console.log(`req.body?.password: ${req.body?.password}`);
    console.log(``);
    if (req.body?.user === "test" && req.body?.password === "test") {
      authData = {
        user: req.body.user,
        authed: true,
      };
      req.session.user = req.body.user;
    } else {
      authData = {
        user: "",
        authed: false,
      };
    }
    console.log(`req.sessionID: ${req.sessionID}`);

    res.header("Content-Type", "application/json");
    res.send(JSON.stringify(authData));
  });

  app.get("/logout", (req, res) => {
    req.session.destroy(() => {
      console.log("logout detected.");
      res.sendStatus(200); // OK
    });
  });
};

export default addAuthMiddlewares;
