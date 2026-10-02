import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { status } from "../util/constants.js";

const validateInput = (validator: (inputObj: any) => Joi.ValidationResult) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = validator(req.body);
    if (error)
      return res.status(status.badRequest).send(error.details[0].message);

    next();
  };
};

export default validateInput;
