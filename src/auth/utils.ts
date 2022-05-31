import { DBUsers } from "../database/dbTypes";
import knex from "../database/knex";
import http from "http";
import { Request } from "express";
import { Sessions } from "./Sessions";
import { renderError } from "../utils";

export const isDocnameValid = async (docname: string): Promise<boolean> => {
  try {
    const storedUsers = await knex<DBUsers>("users").where("id", docname);

    if (storedUsers.length === 0) {
      console.log("docname does not exist.");
      return false;
    }

    console.log("docname exist.");
    return true;
  } catch (e) {
    renderError(e);
    return false;
  }
};
