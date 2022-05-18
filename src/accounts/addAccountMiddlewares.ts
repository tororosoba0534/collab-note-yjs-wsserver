import { Express } from "express";
import {
  changePasswordHandler,
  changeUsernameHandler,
  checkUsernameHandler,
  deleteAccountHandler,
  registerHandler,
} from "./handlers";

const addAccountMiddlewares = (app: Express) => {
  app.post("/register", registerHandler);
  app.post("/check-username", checkUsernameHandler);
  app.post("/delete-account", deleteAccountHandler);
  app.post("/change-username", changeUsernameHandler);
  app.post("/change-password", changePasswordHandler);
};

export default addAccountMiddlewares;
