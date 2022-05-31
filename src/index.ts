import config from "./config";
import server from "./server";

server.listen(config.server.PORT, () => {
  console.log("Listen on port: ", config.server.PORT);
});
