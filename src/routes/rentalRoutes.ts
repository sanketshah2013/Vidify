import { Router } from "express";
import Joi from "joi";
import { handleDBErrors } from "../util/initDataLoad.js";
import {
  CustomerModel,
  MovieModel,
  RentalModel,
} from "../util/schemaModels.js";
import { status } from "../util/constants.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const rentals = await RentalModel.find().sort("-dateOut");
    res.send(rentals);
  } catch (err) {
    handleDBErrors(res, err);
  }
});

router.post("/", async (req, res) => {
  const { error } = validateRental(req.body);
  if (error)
    return res.status(status.badRequest).send(error.details[0].message);

  try {
    const customer = await CustomerModel.findById(req.body.customerId).select(
      "_id name isGold phone",
    );
    if (!customer)
      return res
        .status(status.badRequest)
        .send("Customer for given ID not found!");

    const movie = await MovieModel.findById(req.body.movieId);
    if (!movie)
      return res
        .status(status.badRequest)
        .send("Movie for given ID not found!");

    console.log(movie);
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
    await movie.save();

    res.send(rental);
  } catch (err) {
    handleDBErrors(res, err);
  }
});

router.put("/:id", async (req, res) => {
  const { error } = validateRental(req.body);
  if (error)
    return res.status(status.badRequest).send(error.details[0].message);

  try {
    const rental = await RentalModel.findByIdAndUpdate(
      req.params.id,
      {
        dateReturned: req.body.dateReturned,
        rentalFee: req.body.rentalFee,
      },
      { returnDocument: "after" },
    );
    if (!rental)
      return res
        .status(status.badRequest)
        .send("Rental for given ID not found!");

    res.send(rental);
  } catch (err) {
    handleDBErrors(res, err);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const rental = await RentalModel.findByIdAndDelete(req.params.id, {
      returnDocument: "after",
    });
    if (!rental)
      return res
        .status(status.badRequest)
        .send("Rental for given ID not found!");
    res.send(rental);
  } catch (err) {
    handleDBErrors(res, err);
  }
});

const validateRental = (
  rentalObj: Record<string, string>,
): Joi.ValidationResult => {
  const schema = Joi.object({
    customerId: Joi.string(),
    movieId: Joi.string(),
    dateReturned: Joi.date().max("now"),
    rentalFee: Joi.number().precision(2).min(0),
  });

  return schema.validate(rentalObj);
};

export default router;
