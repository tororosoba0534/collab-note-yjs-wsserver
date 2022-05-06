import { WebSocket } from "ws";

const setupWSConnection = (ws: WebSocket) => {
  ws.on("message", function message(data) {
    console.log("received: %s", data);
    ws.send(JSON.stringify({ hey: "from ws server!" }));
  });

  ws.send("connection succeeded!");
};

export default setupWSConnection;
