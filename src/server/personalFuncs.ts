import { RequestHandler } from "express";
import { Sessions } from "../auth/Sessions";
import { DBUsers } from "../database/dbTypes";
import knex from "../database/knex";

export const checkAuth = async (sessionID: string): Promise<string> => {
  if (!sessionID) {
    return "";
  }
  const storedUsername = await Sessions.token2Username(sessionID);
  return storedUsername;
};

// /*
//   check-auth:
//   {
//     sessionID: string
//   } -> {
//     authed: boolean
//     username: string
//   }
//   */
// type checkAuthResData = {
//   authed: boolean;
//   username: string;
// };

// export const checkAuthHandler: RequestHandler = async (req, res) => {
//   const { sessionID } = req.body;
//   let resData: checkAuthResData;
//   // if this request doesn't have any cookies, that means it isn't
//   // authenticated. Return an error code.
//   console.log(`sessionID in req: ${sessionID}`);
//   if (!sessionID || typeof sessionID !== "string") {
//     resData = {
//       username: "",
//       authed: false,
//     };
//     res.send(JSON.stringify(resData));
//     return;
//   }

//   // We then get the session of the user from our session map
//   // that we set in the signinHandler
//   const storedUsername = await sessionsRedisStore.get(sessionID);
//   if (!storedUsername) {
//     resData = {
//       username: "",
//       authed: false,
//     };
//     res.send(JSON.stringify(resData));
//     return;
//   }
//   // // if the session has expired, return an unauthorized error, and delete the
//   // // session from our map
//   // if (userSession.isExpired()) {
//   //   sessionsStore.delete(sessionID);
//   //   resData = {
//   //     username: "",
//   //     authed: false,
//   //   };
//   //   res.send(JSON.stringify(resData));
//   //   return;
//   // }

//   // If all checks have passed, we can consider the user authenticated and
//   // send a welcome message
//   resData = {
//     username: storedUsername,
//     authed: true,
//   };
//   res.send(JSON.stringify(resData));
// };

export const logout = async (sessionID: string): Promise<boolean> => {
  if (!sessionID) {
    return false;
  }

  const storedUsername = await Sessions.token2Username(sessionID);
  if (!storedUsername) {
    return false;
  }

  const result = await Sessions.delete(sessionID);
  return result;
};

// /*
// logout: {
//   sessionID: string
// } -> {
//   logoutStatus: boolean
// }
// */
// type LogoutResData = {
//   logoutStatus: boolean;
// };

// export const logoutHandler: RequestHandler = async (req, res) => {
//   let resData: LogoutResData;
//   const { sessionID } = req.body;
//   if (!sessionID || typeof sessionID !== "string") {
//     resData = {
//       logoutStatus: false,
//     };
//     res.send(JSON.stringify(resData));
//     return;
//   }
//   const storedUsername = await sessionsRedisStore.get(sessionID);
//   if (!storedUsername) {
//     resData = {
//       logoutStatus: false,
//     };
//     res.send(JSON.stringify(resData));
//   }
//   sessionsRedisStore.del(sessionID);
//   resData = {
//     logoutStatus: true,
//   };
//   res.send(JSON.stringify(resData));
// };

export const deleteAccount = async (sessionID: string): Promise<boolean> => {
  if (!sessionID) {
    return false;
  }
  const storedUsername = await Sessions.token2Username(sessionID);

  if (!storedUsername) {
    return false;
  }

  const deleteResult = await knex.transaction(async (trx) => {
    const redisResult = await Sessions.delete(sessionID);

    await trx<DBUsers>("users").where("id", storedUsername).delete();

    return redisResult;
  });

  return deleteResult;
};

// /*
// delete-account: {
//     sessionID: string
//     username: string
// } -> {
//     deleteAccountStatus: boolean
// }
// */
// type deleteAccountResData = {
//   deleteAccountStatus: boolean;
// };
// export const deleteAccountHandler: RequestHandler = (req, res) => {
//   // TODO:
//   // delete doc in postgres
//   const { sessionID, username } = req.body;
//   let resData: deleteAccountResData;
//   if (
//     !username ||
//     !sessionID ||
//     typeof username !== "string" ||
//     typeof sessionID !== "string"
//   ) {
//     console.log("request type invalid.");
//     resData = {
//       deleteAccountStatus: false,
//     };
//     res.send(JSON.stringify(resData));
//     return;
//   }

//   const storedSession = sessionsStore.get(sessionID);
//   if (!storedSession) {
//     console.log("sessionID does NOT exists.");
//     resData = {
//       deleteAccountStatus: false,
//     };
//     res.send(JSON.stringify(resData));
//     return;
//   }
//   const storedUsername = storedSession.username;
//   if (storedUsername !== username) {
//     console.log("username wrong.");
//     resData = {
//       deleteAccountStatus: false,
//     };
//     res.send(JSON.stringify(resData));
//     return;
//   }
//   sessionsStore.delete(sessionID);
//   // usersStore.delete(username);
//   console.log("account deleted");
//   resData = {
//     deleteAccountStatus: true,
//   };
//   res.send(JSON.stringify(resData));
// };

export const changeUsername = async (
  oldSessionID: string,
  newUsername: any
): Promise<string> => {
  if (!oldSessionID || !newUsername || typeof newUsername !== "string") {
    return "";
  }

  const oldUsername = await Sessions.token2Username(oldSessionID);
  if (!oldUsername) return "";

  const newSessionID: string = await knex.transaction(async (trx) => {
    await Sessions.delete(oldSessionID);
    const newSessionID = await Sessions.add(newUsername);
    await trx<DBUsers>("users")
      .where("id", oldUsername)
      .update({ id: newUsername });

    return newSessionID;
  });

  return newSessionID;
};

// /*
//   change-username: {
//       sessionID: string
//       newUsername: string
//   } -> {
//       changeUsernameStatus: boolean
//   }
//   */
// type changeUsernameResData = {
//   changeUsernameStatus: boolean;
// };
// export const changeUsernameHandler: RequestHandler = (req, res) => {
//   // TODO:
//   // change docname in postgres
//   const { sessionID, newUsername } = req.body;
//   let resData: changeUsernameResData;
//   if (
//     !newUsername ||
//     !sessionID ||
//     typeof newUsername !== "string" ||
//     typeof sessionID !== "string"
//   ) {
//     console.log("request type invalid.");
//     resData = {
//       changeUsernameStatus: false,
//     };
//     res.send(JSON.stringify(resData));
//     return;
//   }
//   const storedSession = sessionsStore.get(sessionID);
//   if (!storedSession) {
//     console.log("sessionID invalid.");
//     resData = {
//       changeUsernameStatus: false,
//     };
//     res.send(JSON.stringify(resData));
//     return;
//   }
//   // const storedUsername = storedSession.username;
//   // const password = usersStore.get(storedUsername);
//   // if (!password) {
//   //   console.log("inner mismatch occured in server.");
//   //   resData = {
//   //     changeUsernameStatus: false,
//   //   };
//   //   res.send(JSON.stringify(resData));
//   //   return;
//   // }
//   // if (usersStore.has(newUsername)) {
//   //   console.log("username already exists.");
//   //   resData = {
//   //     changeUsernameStatus: false,
//   //   };
//   //   res.send(JSON.stringify(resData));
//   //   return;
//   // }
//   // usersStore.set(newUsername, password);
//   // usersStore.delete(storedUsername);
//   console.log("changing username succeeded.");
//   resData = {
//     changeUsernameStatus: true,
//   };
//   res.send(JSON.stringify(resData));
// };

export const changePassword = async (
  oldSessionID: string,
  newPassword: any
): Promise<string> => {
  if (!oldSessionID || !newPassword || typeof newPassword !== "string") {
    return "";
  }

  const username = await Sessions.token2Username(oldSessionID);
  if (!username) return "";

  const newSessionID: string = await knex.transaction(async (trx) => {
    await Sessions.delete(oldSessionID);
    const newSessionID = await Sessions.add(username);
    await trx<DBUsers>("users")
      .where("id", username)
      .update({ password: newPassword });

    return newSessionID;
  });

  return newSessionID;
};

// /*
//   change-password: {
//       sessionID
//       newPassword
//   } -> {
//       changePasswordStatus
//   }
//   */
// type changePasswordResData = {
//   changePasswordStatus: boolean;
// };
// export const changePasswordHandler: RequestHandler = (req, res) => {
//   const { sessionID, newPassword } = req.body;
//   let resData: changePasswordResData;
//   if (
//     !newPassword ||
//     !sessionID ||
//     typeof newPassword !== "string" ||
//     typeof sessionID !== "string"
//   ) {
//     console.log("request type invalid.");
//     resData = {
//       changePasswordStatus: false,
//     };
//     res.send(JSON.stringify(resData));
//     return;
//   }
//   const storedSession = sessionsStore.get(sessionID);
//   if (!storedSession) {
//     console.log("sessionID invalid.");
//     resData = {
//       changePasswordStatus: false,
//     };
//     res.send(JSON.stringify(resData));
//     return;
//   }
//   // const storedUsername = storedSession.username;
//   // usersStore.set(storedUsername, newPassword);
//   console.log("changing password succeeded.");
//   resData = {
//     changePasswordStatus: true,
//   };
//   res.send(JSON.stringify(resData));
// };
