import app from "./app";
import { config } from "./config";

app.listen(config.server.port, () => {
  console.log(`Listen ${config.server.port}`);
});
