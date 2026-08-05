import express from "express";
import mongoose from "mongoose";
import router from "./routes/genres.js";
import { createInitialData } from "./util/index.js";

// setup and start server
const app = express();
app.use(express.json());
app.get("/", (req, res) => res.send("Hello World"));
app.use("/api/genres", router);

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Server is running on http://localhost:${port}`),
);

// connect MongDB
mongoose
  .connect("mongodb://localhost:27017/vidify")
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.log("Error connecting to MongoDB...", err));

createInitialData();
