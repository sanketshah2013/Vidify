import { Request, Response, Router } from "express";
import Joi from "joi";
import authorize from "../middlewares/authorize.js";
import validateInput from "../middlewares/validateInput.js";
import { status } from "../util/constants.js";
import { MovieModel, RentalModel } from "../util/schemaModels.js";

const validateReturn = (
  returnObj: Record<string, string>,
): Joi.ValidationResult => {
  const schema = Joi.object({
    customerId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "*": "CustomerId is required and should be a valid MongoDB ObjectId",
      }),
    movieId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        "*": "MovieId is required and should be a valid MongoDB ObjectId",
      }),
  });

  return schema.validate(returnObj);
};

const router = Router();

router.post(
  "/",
  [authorize, validateInput(validateReturn)],
  async (req: Request, res: Response) => {
    const rental = await (RentalModel as any).lookUp(
      req.body.customerId,
      req.body.movieId,
    );
    if (!rental) return res.status(status.notFound).send("Rental not found!");

    if (rental.dateReturned)
      return res.status(status.badRequest).send("Return already processed!");

    rental.processReturn();
    await rental.save();

    await MovieModel.updateOne(
      { _id: req.body.movieId },
      { $inc: { numberInStock: 1 } },
    );

    res.send(rental);
  },
);

export default router;
