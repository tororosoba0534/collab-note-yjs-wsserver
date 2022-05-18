import { RequestHandler } from "express";
import { sessionsStore, usersStore } from "../auth/sessions";

/*
register: {
    username: string
    password: string
} -> {
    registerStatus: boolean
}
*/
type registerResData = {
  registerStatus: boolean;
};
export const registerHandler: RequestHandler = (req, res) => {
  const { username, password } = req.body;
  let resData: registerResData;

  if (
    !username ||
    !password ||
    typeof username !== "string" ||
    typeof password !== "string"
  ) {
    console.log("request type invalid.");
    resData = {
      registerStatus: false,
    };
    res.send(JSON.stringify(resData));
    return;
  }

  if (usersStore.has(username)) {
    console.log("same name already exists");
    resData = {
      registerStatus: false,
    };
    res.send(JSON.stringify(resData));
    return;
  }

  usersStore.set(username, password);
  console.log("resister succeeded.");
  resData = {
    registerStatus: true,
  };
  res.send(JSON.stringify(resData));
};

/*
check-username: {
    username: string
} -> {
    isValidName: boolean
}
*/
type checkUsernameResData = {
  isValidName: boolean;
};
export const checkUsernameHandler: RequestHandler = (req, res) => {
  const { username } = req.body;
  let resData: checkUsernameResData;
  if (usersStore.has(username)) {
    resData = {
      isValidName: false,
    };
    res.send(JSON.stringify(resData));
    return;
  }

  resData = {
    isValidName: true,
  };
  res.send(JSON.stringify(resData));
};

/*
delete-account: {
    sessionID: string
    username: string
} -> {
    deleteAccountStatus: boolean
}
*/
type deleteAccountResData = {
  deleteAccountStatus: boolean;
};
export const deleteAccountHandler: RequestHandler = (req, res) => {
  const { sessionID, username } = req.body;
  let resData: deleteAccountResData;
  if (
    !username ||
    !sessionID ||
    typeof username !== "string" ||
    typeof sessionID !== "string"
  ) {
    console.log("request type invalid.");
    resData = {
      deleteAccountStatus: false,
    };
    res.send(JSON.stringify(resData));
    return;
  }

  const storedSession = sessionsStore.get(sessionID);
  if (!storedSession) {
    console.log("sessionID does NOT exists.");
    resData = {
      deleteAccountStatus: false,
    };
    res.send(JSON.stringify(resData));
    return;
  }
  const storedUsername = storedSession.username;
  if (storedUsername !== username) {
    console.log("username wrong.");
    resData = {
      deleteAccountStatus: false,
    };
    res.send(JSON.stringify(resData));
    return;
  }
  sessionsStore.delete(sessionID);
  usersStore.delete(username);
  console.log("account deleted");
  resData = {
    deleteAccountStatus: true,
  };
  res.send(JSON.stringify(resData));
};

/*
change-username: {
    sessionID: string
    newUsername: string
} -> {
    changeUsernameStatus: boolean
}
*/
type changeUsernameResData = {
  changeUsernameStatus: boolean;
};
export const changeUsernameHandler: RequestHandler = (req, res) => {
  const { sessionID, newUsername } = req.body;
  let resData: changeUsernameResData;
  if (
    !newUsername ||
    !sessionID ||
    typeof newUsername !== "string" ||
    typeof sessionID !== "string"
  ) {
    console.log("request type invalid.");
    resData = {
      changeUsernameStatus: false,
    };
    res.send(JSON.stringify(resData));
    return;
  }
  const storedSession = sessionsStore.get(sessionID);
  if (!storedSession) {
    console.log("sessionID invalid.");
    resData = {
      changeUsernameStatus: false,
    };
    res.send(JSON.stringify(resData));
    return;
  }
  const storedUsername = storedSession.username;
  const password = usersStore.get(storedUsername);
  if (!password) {
    console.log("inner mismatch occured in server.");
    resData = {
      changeUsernameStatus: false,
    };
    res.send(JSON.stringify(resData));
    return;
  }
  if (usersStore.has(newUsername)) {
    console.log("username already exists.");
    resData = {
      changeUsernameStatus: false,
    };
    res.send(JSON.stringify(resData));
    return;
  }
  usersStore.set(newUsername, password);
  usersStore.delete(storedUsername);
  console.log("changing username succeeded.");
  resData = {
    changeUsernameStatus: true,
  };
  res.send(JSON.stringify(resData));
};

/*
change-password: {
    sessionID
    newPassword
} -> {
    changePasswordStatus
}
*/
type changePasswordResData = {
  changePasswordStatus: boolean;
};
export const changePasswordHandler: RequestHandler = (req, res) => {
  const { sessionID, newPassword } = req.body;
  let resData: changePasswordResData;
  if (
    !newPassword ||
    !sessionID ||
    typeof newPassword !== "string" ||
    typeof sessionID !== "string"
  ) {
    console.log("request type invalid.");
    resData = {
      changePasswordStatus: false,
    };
    res.send(JSON.stringify(resData));
    return;
  }
  const storedSession = sessionsStore.get(sessionID);
  if (!storedSession) {
    console.log("sessionID invalid.");
    resData = {
      changePasswordStatus: false,
    };
    res.send(JSON.stringify(resData));
    return;
  }
  const storedUsername = storedSession.username;
  usersStore.set(storedUsername, newPassword);
  console.log("changing password succeeded.");
  resData = {
    changePasswordStatus: true,
  };
  res.send(JSON.stringify(resData));
};
