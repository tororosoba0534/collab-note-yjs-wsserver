import http from "http";
import stream from "stream";
import { isDocnameValid } from "./utils";
// import { parse as parseCookies } from "cookie";

export const authOnUpgrade = async (
  req: http.IncomingMessage,
  socket: stream.Duplex
): Promise<boolean> => {
  // url path validation
  const isURLValid = await validateURL(req);
  if (!isURLValid) return false;

  // // If you can use cookies for authentication, check cookies here
  // const sessionToken = parseCookies(req.headers.cookie || "")?.sessionID;
  // console.log(`sessionID: ${sessionID}`);
  // if (!sessionID) {
  //   return false;
  // }
  return true;
};

const validateURL = async (req: http.IncomingMessage): Promise<boolean> => {
  let url = req.url;
  if (!url) return false;

  if (url[0] === "/") url = url.slice(1);
  const result = url.split("/");
  if (result[0] !== "editor") return false;

  const username = req.url?.slice(1).split("?")[0].split("/")[1] as string;
  const isUsernameValid = await isDocnameValid(username);
  if (!isUsernameValid) {
    return false;
  }

  return true;
};
