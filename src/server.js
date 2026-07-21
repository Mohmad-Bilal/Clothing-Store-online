require("dotenv").config();

const config = require("./src/config/env.js");
const app = require("./app.js");
const connection = require("./src/database/connection.js");

const port = config.port || 3000;

const startServer = async () => {
  await connection();

  app.listen(port, async () => {
    console.log(`server is running on port ${port}`);
  });
};
startServer();
