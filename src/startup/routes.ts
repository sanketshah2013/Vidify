import express, { Request, Response } from "express";
import errorHandler from "./../middlewares/errorHandler.js";
import authRouter from "./../routes/authRoutes.js";
import customerRouter from "./../routes/customerRoutes.js";
import genreRouter from "./../routes/genreRoutes.js";
import movieRouter from "./../routes/movieRoutes.js";
import rentalRouter from "./../routes/rentalRoutes.js";
import returnRouter from "./../routes/returnRoutes.js";
import userRouter from "./../routes/userRoutes.js";

const setupRoutes = (app: any) => {
  app.use(express.json());
  app.get("/", (req: Request, res: Response) => res.send("Hello World"));
  app.use("/api/genres", genreRouter);
  app.use("/api/customers", customerRouter);
  app.use("/api/movies", movieRouter);
  app.use("/api/rentals", rentalRouter);
  app.use("/api/returns", returnRouter);
  app.use("/api/users", userRouter);
  app.use("/api/auth", authRouter);

  // Always keep error handler middleware at the last
  app.use(errorHandler);
};

export default setupRoutes;
