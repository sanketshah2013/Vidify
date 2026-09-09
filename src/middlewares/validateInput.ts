import { NextFunction, Request, Response } from "express";
import Joi from "joi";

const validateInput = (validator: (inputObj: any) => Joi.ValidationResult) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = validator(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    next();
  };
};

export default validateInput;
