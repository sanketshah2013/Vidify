import config from "config";
import mongoose from "mongoose";
import { createInitialData } from "../util/initDataLoad.js";
import logger from "./logger.js";

const setupDB = () => {
  const db = config.get("db") as string;
  // connect MongDB
  mongoose
    .connect(db)
    .then(() => logger.info(`Connected to ${db}`))
    .catch((err) => logger.error(`Error connecting to ${db}\n${err}`));

  if (
    process.env.NODE_ENV !== "production" &&
    process.env.NODE_ENV !== "test"
  ) {
    createInitialData();
  }
};

export default setupDB;
