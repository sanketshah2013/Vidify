import express from "express";
import setupDB from "../../startup/db.js";
import setupRoutes from "../../startup/routes.js";

// Setting up separate app for tests to avoid issue of main server process
// running continuously in background and not terminating correctly
// leading to leaks in system.

// setup server
const app = express();
setupRoutes(app);

// setup database
setupDB();

export default app;
