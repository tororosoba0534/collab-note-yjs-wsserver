import http from "http";
import stream from "stream";
import { parse as cookieParse } from "cookie";

export const authOnUpgrade = (
  req: http.IncomingMessage,
  socket: stream.Duplex
): boolean => {
  // url path validation
  if (!validateURL(req)) return false;

  // check cookie
  const sessionToken = cookieParse(req.headers.cookie || "")?.session_token;
  console.log(`sessionToken: ${sessionToken}`);
  if (!sessionToken) {
    return false;
  }
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
