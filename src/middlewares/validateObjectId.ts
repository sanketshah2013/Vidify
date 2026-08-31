import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { status } from "../util/constants.js";

const validateObjectId = (req: Request, res: Response, next: NextFunction) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id as string))
    return res.status(status.badRequest).send("Invalid ID!");

  next();
};

export default validateObjectId;
