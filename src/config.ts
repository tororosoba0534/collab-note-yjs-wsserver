import path from "path";
export const config = {
  server: {
    port: Number(process.env.PORT) || 8080,
    craFilePath: path.resolve(__dirname, "../../client/build"),
  },
  db: {
    host: process.env.DB_HOST as string,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER as string,
    name: process.env.DB_NAME as string,
    password: process.env.DB_PASSWORD as string,
  },
};
