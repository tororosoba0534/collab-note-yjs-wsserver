import server from "./app";
import config from "./config";

server.listen(config.server.port, () => {
  console.log("Listen on port: ", config.server.port);
});
