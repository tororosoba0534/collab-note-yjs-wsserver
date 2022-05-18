import { Express } from "express";
// import cookieParser from "cookie-parser";
import { checkAuthHandler, loginHandler, logoutHandler } from "./handlers";

const addAuthMiddlewares = (app: Express) => {
  // app.use(cookieParser());

  app.post("/check-auth", checkAuthHandler);

  app.post("/login", loginHandler);

  app.post("/logout", logoutHandler);
};

export default addAuthMiddlewares;
