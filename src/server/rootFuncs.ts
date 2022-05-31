import { RequestHandler } from "express";
import { string } from "lib0";
import { Sessions } from "../auth/Sessions";
import { DBUsers } from "../database/dbTypes";
import knex from "../database/knex";

export const register = async (
  username: any,
  password: any
): Promise<boolean> => {
  if (
    !username ||
    !password ||
    typeof username !== "string" ||
    typeof password !== "string"
  ) {
    console.error("request type invalid.");
    return false;
  }
  const dbResult = await knex.transaction(async (trx) => {
    const stored = await trx<DBUsers>("users")
      .where("id", username)
      .forUpdate();
    if (stored.length !== 0) {
      console.log("same name already exists");

      return false;
    }

    await trx<DBUsers>("users").insert({ id: username, password });
    console.log("resister succeeded.");
    return true;
  });

  return dbResult;
};

// /*
// register: {
//     username: string
//     password: string
// } -> {
//     registerStatus: boolean
// }
// */
// type registerResData = {
//   registerStatus: boolean;
// };
// export const registerHandler: RequestHandler = async (req, res) => {
//   const { username, password } = req.body;
//   let resData: registerResData;

//   if (
//     !username ||
//     !password ||
//     typeof username !== "string" ||
//     typeof password !== "string"
//   ) {
//     console.log("request type invalid.");
//     resData = {
//       registerStatus: false,
//     };
//     res.send(JSON.stringify(resData));
//     return;
//   }

//   await knex.transaction(async (trx) => {
//     const stored = await trx<DBUsers>("users")
//       .where("id", username)
//       .forUpdate();
//     if (stored.length !== 0) {
//       console.log("same name already exists");
//       resData = {
//         registerStatus: false,
//       };
//       res.send(JSON.stringify(resData));
//       return;
//     }

//     await trx<DBUsers>("users").insert({ id: username, password });
//     console.log("resister succeeded.");
//     resData = {
//       registerStatus: true,
//     };
//     res.send(JSON.stringify(resData));
//   });
// };

export const checkUsername = async (username: any): Promise<boolean> => {
  if (!username || typeof username !== "string") {
    return false;
  }
  const stored = await knex<DBUsers>("users").where("id", username);

  if (stored.length !== 0) {
    return false;
  }
  return true;
};

// /*
//   check-username: {
//       username: string
//   } -> {
//       isValidName: boolean
//   }
//   */
// type checkUsernameResData = {
//   isValidName: boolean;
// };
// export const checkUsernameHandler: RequestHandler = async (req, res) => {
//   const { username } = req.body;
//   let resData: checkUsernameResData;

//   if (!username || typeof username !== "string") {
//     console.log("req type invalid.");
//     resData = {
//       isValidName: false,
//     };
//     res.send(JSON.stringify(resData));
//     return;
//   }

//   const stored = await knex<DBUsers>("users").where("id", username);

//   if (stored.length !== 0) {
//     resData = {
//       isValidName: false,
//     };
//     res.send(JSON.stringify(resData));
//     return;
//   }

//   resData = {
//     isValidName: true,
//   };
//   res.send(JSON.stringify(resData));
// };

export const login = async (username: any, password: any): Promise<string> => {
  if (
    !username ||
    !password ||
    typeof username !== "string" ||
    typeof password !== "string"
  ) {
    return "";
  }

  const storedUserData = await knex<DBUsers>("users")
    .where("id", username)
    .then((stored) => {
      console.log(`user data in postgres: ${JSON.stringify(stored)}`);
      return stored;
    });

  if (storedUserData.length === 0) {
    console.log("user does NOT exist.");
    return "";
  }
  const expectedPassword = storedUserData[0].password;
  if (!expectedPassword || expectedPassword !== password) {
    return "";
  }

  const sessionID = await Sessions.add(username);

  console.log(`sessionID generated: ${sessionID}`);
  return sessionID;
};

/*
login:
{
  username: string,
  password: string
} -> {
  authed: boolean,
  sessionID: string
}
*/
type LoginResData = {
  authed: boolean;
  sessionID: string;
};
export const loginHandler: RequestHandler = async (req, res) => {
  console.log("login detected.");

  // get users credentials from the JSON body
  const { username, password } = req.body;

  let resData: LoginResData;

  if (
    !username ||
    !password ||
    typeof username !== "string" ||
    typeof password !== "string"
  ) {
    resData = {
      authed: false,
      sessionID: "",
    };

    res.send(JSON.stringify(resData));
    return;
  }

  const storedUserData = await knex<DBUsers>("users")
    .where("id", username)
    .then((stored) => {
      console.log(`user data in postgres: ${JSON.stringify(stored)}`);
      return stored;
    });

  if (storedUserData.length === 0) {
    console.log("user does NOT exist.");
    resData = {
      sessionID: "",
      authed: false,
    };

    res.send(JSON.stringify(resData));
    return;
  }
  const expectedPassword = storedUserData[0].password;
  if (!expectedPassword || expectedPassword !== password) {
    resData = {
      sessionID: "",
      authed: false,
    };

    res.send(JSON.stringify(resData));
    return;
  }

  const sessionID = await Sessions.add(username);

  console.log(`sessionID generated: ${sessionID}`);

  resData = {
    sessionID,
    authed: true,
  };

  res.send(JSON.stringify(resData));
};
