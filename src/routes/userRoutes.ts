import Router from "express";
import Joi from "joi";
import bcrypt from "bcrypt";
import { status } from "../util/constants.js";
import { handleDBErrors } from "../util/initDataLoad.js";
import { UserModel } from "../util/schemaModels.js";
import authorize from "../middlewares/authorize.js";

const router = Router();

router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error)
    return res.status(status.badRequest).send(error.details[0].message);

  try {
    const existingUser = await UserModel.findOne({ email: req.body.email });
    if (existingUser)
      return res.status(status.badRequest).send("User already registered!");

    const { name, email, password, isAdmin } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await new UserModel({
      name,
      email,
      password: hashed,
      isAdmin,
    }).save();

    res.send({ ...(user as any)._doc, password: undefined });
  } catch (err) {
    handleDBErrors(res, err);
  }
});

router.get("/me", authorize, async (req, res) => {
  const user = await UserModel.findById((req as any).user._id).select(
    "-password",
  );

  res.send(user);
});

const validateUser = (userObj: User): Joi.ValidationResult => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(20).required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string()
      .trim()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      )
      .messages({
        "*": "Password requires atleast 1 lowercase, 1 uppercase, 1 digit, 1 special char [@$!%*?&]. Total length should be 8 or more characters!",
      }),
    isAdmin: Joi.boolean(),
  });

  return schema.validate(userObj);
};

export default router;
