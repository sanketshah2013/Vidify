import config from "config";
import express from "express";
import setupDB from "./startup/db.js";
import logger from "./startup/logger.js";
import setupRoutes from "./startup/routes.js";

// setup config. Move this to individual file if more than 1
if (!config.get("jwtPrivateKey")) {
  logger.error("FATAL ERROR: jwtPrivateKey is not defined!");
  process.exit(1);
}

// setup server
const app = express();
setupRoutes(app);

// setup database
setupDB();

// start server
const port = process.env.PORT || 3000;
app.listen(port, () =>
  logger.info(`Server is running on http://localhost:${port}`),
);
