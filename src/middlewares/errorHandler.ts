import { ErrorRequestHandler, Request, Response } from "express";
import { status } from "../util/constants.js";

const errorHandler = (
  err: ErrorRequestHandler,
  req: Request,
  res: Response,
) => {
  console.error(err);
  res.status(status.serverErr).send("Something failed!");
};

export default errorHandler;
