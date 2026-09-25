const mongoose = require("mongoose");
const config = require("../config/env.js");

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to DB");
});
mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected from DB");
});
mongoose.connection.on("reconnected", () => {
  console.log("Mongoose reconnected to DB");
});
mongoose.connection.on("error", (error) => {
  console.error("Mongoose connection error", error);
});

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connection to MongoDB", err);
    process.exit(1);
  }
};
module.exports = connectDB;
