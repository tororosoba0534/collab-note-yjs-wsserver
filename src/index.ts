import server from "./app";
import config from "./config";

server.listen(config.server.PORT, () => {
  console.log("Listen on port: ", config.server.PORT);
});
