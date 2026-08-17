import { NextFunction, Request, Response } from "express";
import { status } from "../util/constants.js";

export default (req: Request, res: Response, next: NextFunction) => {
  if (!(req as any).user.isAdmin)
    return res.status(status.forbidden).send("Forbidden, access denied!");

  next();
};
