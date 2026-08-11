import express from "express";
import mongoose from "mongoose";
import customerRouter from "./routes/customerRoutes.js";
import genreRouter from "./routes/genreRoutes.js";
import movieRouter from "./routes/movieRoutes.js";
import rentalRouter from "./routes/rentalRoutes.js";
import { createInitialData } from "./util/initDataLoad.js";

// setup server
const app = express();
app.use(express.json());
app.get("/", (req, res) => res.send("Hello World"));
app.use("/api/genres", genreRouter);
app.use("/api/customers", customerRouter);
app.use("/api/movies", movieRouter);
app.use("/api/rentals", rentalRouter);

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
