import Router, { Request, Response } from "express";
import Joi from "joi";
import admin from "../middlewares/admin.js";
import authorize from "../middlewares/authorize.js";
import { GenreModel, MovieModel } from "../util/schemaModels.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import validateInput from "../middlewares/validateInput.js";
import { status } from "../util/constants.js";

const validateMovie = (movieObj: Movie): Joi.ValidationResult => {
  const schema = Joi.object({
    title: Joi.string()
      .trim()
      .pattern(/^[a-zA-Z0-9 ]+$/) // Allows alphanumeric and spaces only
      .min(1)
      .max(50)
      .required()
      .messages({
        "*": "Title should be max 50 characters. Alphanumeric and spaces allowed!",
      }),
    genreId: Joi.string()
      .required()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .messages({ "*": "GenreId should be a valid MongoDB ObjectId" }),
    numberInStock: Joi.string()
      .pattern(/^\d{1,10}$/)
      .required()
      .messages({
        "*": "Number In Stock must be between 1 to 10 characters long!",
      }),
    dailyRentalRate: Joi.string()
      .pattern(/^\d{1,10}$/)
      .required()
      .messages({
        "*": "Daily Rental Rate must be between 1 to 10 characters long!",
      }),
  });
  return schema.validate(movieObj);
};

const router = Router();

router.get("/", async (req, res) => {
  const movies = await MovieModel.find()
    .sort("title")
    .select("title genre numberInStock dailyRentalRate")
    .populate("genre");
  res.send(movies);
});

router.post(
  "/",
  [authorize, validateInput(validateMovie)],
  async (req: Request<{}, any, Movie>, res: Response) => {
    const { title, genreId, numberInStock, dailyRentalRate } = req.body;
    const genre = await GenreModel.findById(genreId).select("_id name");
    if (!genre)
      return res.status(status.notFound).send("Genre for given ID not found!");

    const newMovie = await new MovieModel({
      title,
      genre: genre._id,
      numberInStock,
      dailyRentalRate,
    }).populate("genre");
    await newMovie.save();

    res.send(newMovie);
  },
);

router.get("/:id", validateObjectId, async (req, res) => {
  const movie = await MovieModel.findById(req.params.id).populate("genre");
  if (!movie)
    return res.status(status.notFound).send("Movie for given ID not found!");
  res.send(movie);
});

router.put(
  "/:id",
  [validateObjectId, authorize, validateInput(validateMovie)],
  async (req: Request<{ id: string }, any, Movie>, res: Response) => {
    // Lookup and update the movie
    const { title, genreId, numberInStock, dailyRentalRate } = req.body;

    const genre = await GenreModel.findById(genreId).select("_id name");
    if (!genre)
      return res.status(status.notFound).send("Genre for given ID not found!");

    const movie = await MovieModel.findByIdAndUpdate(
      req.params.id,
      { title, genre: genre._id, numberInStock, dailyRentalRate },
      { returnDocument: "after", runValidators: true },
    ).populate("genre");

    if (!movie)
      return res.status(status.notFound).send("Movie for given ID not found!");

    res.send(movie);
  },
);

router.delete(
  "/:id",
  [validateObjectId, authorize, admin],
  async (req: Request, res: Response) => {
    // Lookup and remove the movie
    const movie = await MovieModel.findByIdAndDelete(req.params.id, {
      returnDocument: "after",
    }).populate("genre");
    if (!movie)
      return res.status(status.notFound).send("Movie for given ID not found!");

    res.send(movie);
  },
);

export default router;
