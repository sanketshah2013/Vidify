import Router from "express";
import Joi from "joi";

const router = Router();

const genres = [
  { id: 1, name: "action" },
  { id: 2, name: "comedy" },
  { id: 3, name: "thriller" },
];

router.get("/", (req, res) => {
  res.send(genres);
});

router.post("/", (req, res) => {
  const { error } = validateGenre(req.body);
  if (error) return res.status(400).send(error?.details[0].message);

  const newGenre = { id: genres.length + 1, name: req.body.name };
  genres.push(newGenre);
  res.send(newGenre);
});

router.get("/:id", (req, res) => {
  const genre = genres.find(({ id }) => id === parseInt(req.params.id));
  if (!genre) res.status(404).send("Genre for given ID not found!");
  res.send(genre);
});

router.put("/:id", (req, res) => {
  // Lookup the genre
  const genre = genres.find(({ id }) => id === parseInt(req.params.id));
  if (!genre) return res.status(404).send("Genre for given ID not found!");

  // Validate the input
  const { error } = validateGenre(req.body);
  if (error) return res.status(400).send(error?.details[0].message);

  // update genre
  genre.name = req.body.name;
  res.send(genre);
});

router.delete("/:id", (req, res) => {
  // Lookup the genre
  const genre = genres.find(({ id }) => id === parseInt(req.params.id));
  if (!genre) return res.status(404).send("Genre for given ID not found!");

  // Delete the genre
  const index = genres.indexOf(genre);
  genres.splice(index, 1);
  res.status(200).send("Genre for given ID deleted successfully!");
});

const validateGenre = (
  nameObj: Record<"name", string>,
): Joi.ValidationResult => {
  const schema = Joi.object({ name: Joi.string().min(3).required() });
  return schema.validate(nameObj);
};

export default router;
