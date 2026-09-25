const config = require("./config/env.js");
const app = require("./app.js");
const connection = require("./database/connection.js");

const startServer = async () => {
  await connection();

  app.listen(config.port, () => {
    console.log(`server is running on port ${config.port}`);
  });
};
startServer();
