import config from "config";
import express from "express";
import mongoose from "mongoose";
import authRouter from "./routes/authRoutes.js";
import customerRouter from "./routes/customerRoutes.js";
import genreRouter from "./routes/genreRoutes.js";
import movieRouter from "./routes/movieRoutes.js";
import rentalRouter from "./routes/rentalRoutes.js";
import userRouter from "./routes/userRoutes.js";
import { createInitialData } from "./util/initDataLoad.js";

if (!config.get("jwtPrivateKey")) {
  console.error("FATAL ERROR: jwtPrivateKey is not defined!");
  process.exit(1);
}

// setup server
const app = express();
app.use(express.json());
app.get("/", (req, res) => res.send("Hello World"));
app.use("/api/genres", genreRouter);
app.use("/api/customers", customerRouter);
app.use("/api/movies", movieRouter);
app.use("/api/rentals", rentalRouter);
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);

// connect MongDB
mongoose
  .connect("mongodb://localhost:27017/vidify")
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.log("Error connecting to MongoDB...", err));

createInitialData();

// start server
const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Server is running on http://localhost:${port}`),
);
