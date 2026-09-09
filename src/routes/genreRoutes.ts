import Router, { Request, Response } from "express";
import Joi from "joi";
import admin from "../middlewares/admin.js";
import authorize from "../middlewares/authorize.js";
import { GenreModel } from "../util/schemaModels.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import validateInput from "../middlewares/validateInput.js";

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

const router = Router();

router.get("/", async (req, res) => {
  const genres = await GenreModel.find()
    .sort("name")
    .select("name description slug");
  res.send(genres);
});

router.post(
  "/",
  [authorize, validateInput(validateGenre)],
  async (req: Request<{}, any, Genre>, res: Response) => {
    const { name, description, slug } = req.body;
    const newGenre = await new GenreModel({ name, description, slug }).save();
    res.send(newGenre);
  },
);

router.get("/:id", validateObjectId, async (req, res) => {
  const genre = await GenreModel.findById(req.params.id);
  if (!genre) res.status(404).send("Genre for given ID not found!");
  res.send(genre);
});

router.put(
  "/:id",
  [validateObjectId, authorize, validateInput(validateGenre)],
  async (req: Request<{ id: string }, any, Genre>, res: Response) => {
    // Lookup and update the genre
    const { name, description, slug } = req.body;
    const genre = await GenreModel.findByIdAndUpdate(
      req.params.id,
      { name, description, slug },
      { returnDocument: "after", runValidators: true },
    );
    if (!genre) return res.status(404).send("Genre for given ID not found!");

    res.send(genre);
  },
);

router.delete(
  "/:id",
  [validateObjectId, authorize, admin],
  async (req: Request, res: Response) => {
    // Lookup and remove the genre
    const genre = await GenreModel.findByIdAndDelete(req.params.id, {
      returnDocument: "after",
    });
    if (!genre) return res.status(404).send("Genre for given ID not found!");

    res.send(genre);
  },
);

export default router;
