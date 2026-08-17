import Router, { Request, Response } from "express";
import Joi from "joi";
import { GenreModel, MovieModel } from "../util/schemaModels.js";
import { handleDBErrors } from "../util/initDataLoad.js";
import authorize from "../middlewares/authorize.js";
import admin from "../middlewares/admin.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const movies = await MovieModel.find()
      .sort("title")
      .select("title genre numberInStock dailyRentalRate");
    res.send(movies);
  } catch (err) {
    handleDBErrors(res, err);
  }
});

router.post("/", authorize, async (req: Request<{}, any, Movie>, res) => {
  const { error } = validateMovie(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { title, genreId, numberInStock, dailyRentalRate } = req.body;
  try {
    const genre = await GenreModel.findById(genreId).select("_id name");
    if (!genre) return res.status(404).send("Genre for given ID not found!");

    const newMovie = await new MovieModel({
      title,
      genre,
      numberInStock,
      dailyRentalRate,
    }).save();

    res.send(newMovie);
  } catch (err) {
    handleDBErrors(res, err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const movie = await MovieModel.findById(req.params.id);
    if (!movie) res.status(404).send("Movie for given ID not found!");
    res.send(movie);
  } catch (err) {
    handleDBErrors(res, err);
  }
});

router.put(
  "/:id",
  authorize,
  async (req: Request<{ id: string }, any, Movie>, res) => {
    // Validate the input
    const { error } = validateMovie(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Lookup and update the movie
    try {
      const { title, genreId, numberInStock, dailyRentalRate } = req.body;
      const genre = await GenreModel.findById(genreId).select("_id name");
      if (!genre) return res.status(404).send("Genre for given ID not found!");

      const movie = await MovieModel.findByIdAndUpdate(
        req.params.id,
        { title, genre, numberInStock, dailyRentalRate },
        { returnDocument: "after", runValidators: true },
      );
      if (!movie) return res.status(404).send("Movie for given ID not found!");

      res.send(movie);
    } catch (err) {
      handleDBErrors(res, err);
    }
  },
);

router.delete(
  "/:id",
  [authorize, admin],
  async (req: Request, res: Response) => {
    // Lookup and remove the movie
    try {
      const movie = await MovieModel.findByIdAndDelete(req.params.id, {
        returnDocument: "after",
      });
      if (!movie) return res.status(404).send("Movie for given ID not found!");

      res.send(movie);
    } catch (err) {
      handleDBErrors(res, err);
    }
  },
);

const validateMovie = (movieObj: Movie): Joi.ValidationResult => {
  const schema = Joi.object({
    title: Joi.string()
      .trim()
      .pattern(/^[a-zA-Z0-9 ]+$/) // Allows alphanumeric and spaces only
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

export default router;
