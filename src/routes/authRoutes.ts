import bcrypt from "bcrypt";
import Router from "express";
import Joi from "joi";
import { status } from "../util/constants.js";
import { handleDBErrors } from "../util/initDataLoad.js";
import { UserModel } from "../util/schemaModels.js";

const router = Router();

router.post("/", async (req, res) => {
  const { error } = validateAuth(req.body);
  if (error)
    return res.status(status.badRequest).send(error.details[0].message);

  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user)
      return res.status(status.badRequest).send("Invalid email or password");

    const isValidPwd = await bcrypt.compare(req.body.password, user.password);
    if (!isValidPwd)
      return res.status(status.badRequest).send("Invalid email or password");

    // By default, TypeScript has no way of knowing what functions you are attaching to schema.methods (ignore err)
    const token = (user as any).generateAuthToken();

    res.header("x-auth-token", token).send("Login Success!");
  } catch (err) {
    handleDBErrors(res, err);
  }
});

const validateAuth = (
  authObj: Record<string, string>,
): Joi.ValidationResult => {
  const schema = Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().trim().required(),
  });

  return schema.validate(authObj);
};

export default router;
