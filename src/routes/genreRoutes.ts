import Router, { Request, Response } from "express";
import Joi from "joi";
import admin from "../middlewares/admin.js";
import authorize from "../middlewares/authorize.js";
import { handleDBErrors } from "../util/initDataLoad.js";
import { GenreModel } from "../util/schemaModels.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const genres = await GenreModel.find()
      .sort("name")
      .select("name description slug");
    res.send(genres);
  } catch (err) {
    handleDBErrors(res, err);
  }
});

router.post("/", authorize, async (req: Request<{}, any, Genre>, res) => {
  const { error } = validateGenre(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { name, description, slug } = req.body;
  try {
    const newGenre = await new GenreModel({ name, description, slug }).save();
    res.send(newGenre);
  } catch (err) {
    handleDBErrors(res, err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const genre = await GenreModel.findById(req.params.id);
    if (!genre) res.status(404).send("Genre for given ID not found!");
    res.send(genre);
  } catch (err) {
    handleDBErrors(res, err);
  }
});

router.put(
  "/:id",
  authorize,
  async (req: Request<{ id: string }, any, Genre>, res) => {
    // Validate the input
    const { error } = validateGenre(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Lookup and update the genre
    try {
      const { name, description, slug } = req.body;
      const genre = await GenreModel.findByIdAndUpdate(
        req.params.id,
        { name, description, slug },
        { returnDocument: "after", runValidators: true },
      );
      if (!genre) return res.status(404).send("Genre for given ID not found!");

      res.send(genre);
    } catch (err) {
      handleDBErrors(res, err);
    }
  },
);

router.delete(
  "/:id",
  [authorize, admin],
  async (req: Request, res: Response) => {
    // Lookup and remove the genre
    try {
      const genre = await GenreModel.findByIdAndDelete(req.params.id, {
        returnDocument: "after",
      });
      if (!genre) return res.status(404).send("Genre for given ID not found!");

      res.send(genre);
    } catch (err) {
      handleDBErrors(res, err);
    }
  },
);

const validateGenre = (genreObj: Genre): Joi.ValidationResult => {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(15).required(),
    description: Joi.string()
      .trim()
      .pattern(/^[a-zA-Z0-9 ]+$/) // Allows alphanumeric and spaces only
      .max(20),
    slug: Joi.string().trim().uri(),
  });
  return schema.validate(genreObj);
};

export default router;
