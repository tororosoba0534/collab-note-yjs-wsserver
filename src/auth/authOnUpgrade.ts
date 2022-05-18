import http from "http";
import stream from "stream";
import { parse as cookieParse } from "cookie";

export const authOnUpgrade = (
  req: http.IncomingMessage,
  socket: stream.Duplex
): boolean => {
  // url path validation
  if (!validateURL(req)) return false;

  // // If you can use cookies for authentication, check cookies here
  // const sessionToken = cookieParse(req.headers.cookie || "")?.sessionID;
  // console.log(`sessionID: ${sessionID}`);
  // if (!sessionID) {
  //   return false;
  // }
  return true;
};

const validateURL = (req: http.IncomingMessage): boolean => {
  let url = req.url;
  if (!url) return false;
  if (url[0] === "/") url = url.slice(1);
  const result = url.split("/");
  if (result[0] === "editor") return true;
  return false;
};
