import { NextFunction, Request, Response } from "express";

const asyncHandler = (handler: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res);
    } catch (err) {
      next(err);
    }
  };
};

export default asyncHandler;
