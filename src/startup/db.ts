import mongoose from "mongoose";
import { createInitialData } from "../util/initDataLoad.js";
import logger from "./logger.js";

const setupDB = () => {
  // connect MongDB
  mongoose
    .connect("mongodb://localhost:27017/vidify")
    .then(() => logger.info("Connected to MongoDB..."))
    .catch((err) => logger.error("Error connecting to MongoDB...", err));

  if (process.env.NODE_ENV !== "production") {
    createInitialData();
  }
};

export default setupDB;
