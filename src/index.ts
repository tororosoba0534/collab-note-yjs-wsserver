// import app from "./app";
// import { config } from "./config";

// app.listen(config.server.port, () => {
//   console.log(`Listen ${config.server.port}`);
// });
import { WebSocketServer } from "ws";
import { config } from "./config";

const wss = new WebSocketServer({ port: config.server.port });

wss.on("connection", function connection(ws) {
  ws.on("message", function message(data) {
    console.log("received: %s", data);
    ws.send(JSON.stringify({ hey: "from ws server!" }));
  });

  ws.send("something");
});
