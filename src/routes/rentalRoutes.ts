import { Request, Response, Router } from "express";
import Joi from "joi";
import admin from "../middlewares/admin.js";
import authorize from "../middlewares/authorize.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import { status } from "../util/constants.js";
import {
  CustomerModel,
  MovieModel,
  RentalModel,
} from "../util/schemaModels.js";
import validateInput from "../middlewares/validateInput.js";

const validateRental = (
  rentalObj: Record<string, string>,
): Joi.ValidationResult => {
  const schema = Joi.object({
    customerId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .messages({ "*": "CustomerId should be a valid MongoDB ObjectId" }),
    movieId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .messages({ "*": "CustomerId should be a valid MongoDB ObjectId" }),
    dateReturned: Joi.date().max("now"),
    rentalFee: Joi.number().precision(2).min(0),
  });

  return schema.validate(rentalObj);
};

const router = Router();

router.get("/", async (req, res) => {
  const rentals = await RentalModel.find().sort("-dateOut");
  res.send(rentals);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const rental = await RentalModel.findById(req.params.id);
  if (!rental)
    return res.status(status.notFound).send("rental for given ID not found!");
  res.send(rental);
});

router.post(
  "/",
  [authorize, validateInput(validateRental)],
  async (req: Request, res: Response) => {
    const customer = await CustomerModel.findById(req.body.customerId).select(
      "_id name isGold phone",
    );
    if (!customer)
      return res
        .status(status.notFound)
        .send("Customer for given ID not found!");

    const movie = await MovieModel.findById(req.body.movieId);
    if (!movie)
      return res.status(status.notFound).send("Movie for given ID not found!");

    if (!movie.numberInStock)
      return res.status(status.badRequest).send("Movie not in Stock!");

    const rental = new RentalModel({
      customer,
      movie: {
        _id: movie._id,
        title: movie.title,
        dailyRentalRate: movie.dailyRentalRate,
      },
    });
    await rental.save();

    movie.numberInStock--;

    // Here require implementation of 2 phase commit to properly handle
    // error scenario. If one of the db save action fails, then it should
    // revert the other db action too so that both db states are in sync.
    await movie.save();

    res.send(rental);
  },
);

router.put(
  "/:id",
  [validateObjectId, authorize, validateInput(validateRental)],
  async (req: Request, res: Response) => {
    const rental = await RentalModel.findByIdAndUpdate(
      req.params.id,
      {
        dateReturned: req.body.dateReturned,
        rentalFee: req.body.rentalFee,
      },
      { returnDocument: "after" },
    );
    if (!rental)
      return res.status(status.notFound).send("Rental for given ID not found!");

    res.send(rental);
  },
);

router.delete(
  "/:id",
  [validateObjectId, authorize, admin],
  async (req: Request, res: Response) => {
    const rental = await RentalModel.findByIdAndDelete(req.params.id, {
      returnDocument: "after",
    });
    if (!rental)
      return res.status(status.notFound).send("Rental for given ID not found!");
    res.send(rental);
  },
);

export default router;
