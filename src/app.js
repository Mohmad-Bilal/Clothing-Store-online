const express = require("express");
const errorHandler = require("./middleware/error.middleware");
const authRoutes = require("./routes/auth.routes");
const app = express();
app.use(express.json());

app.use("/api/v1/auth", authRoutes);

app.use(errorHandler);
module.exports = app;
