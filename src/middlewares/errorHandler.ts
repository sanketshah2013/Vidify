import { ErrorRequestHandler, Request, Response } from "express";
import { status } from "../util/constants.js";
import logger from "../startup/logger.js";

const errorHandler = (
  err: ErrorRequestHandler,
  req: Request,
  res: Response,
) => {
  logger.error(err);
  res.status(status.serverErr).send("Something failed!");
};

export default errorHandler;
