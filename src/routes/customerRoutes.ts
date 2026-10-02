import Router, { Request, Response } from "express";
import Joi from "joi";
import admin from "../middlewares/admin.js";
import authorize from "../middlewares/authorize.js";
import { CustomerModel } from "../util/schemaModels.js";
import validateObjectId from "../middlewares/validateObjectId.js";
import validateInput from "../middlewares/validateInput.js";
import { status } from "../util/constants.js";

const validateCustomer = (customerObj: Customer): Joi.ValidationResult => {
  const schema = Joi.object({
    username: Joi.string()
      .trim()
      .pattern(/^[a-z0-9_-]+$/)
      .min(3)
      .max(15)
      .required()
      .messages({
        "*": "Valid username should be lowercase and between 3 to 15 characters. Numbers, hypens and underscores are allowed!",
      }),
    name: Joi.string()
      .trim()
      .pattern(/^[a-zA-Z]+(?:\s+[a-zA-Z]+)+$/)
      .min(3)
      .max(20)
      .required()
      .messages({
        "*": "Name require both first and last name (letters only)",
      }),
    isGold: Joi.boolean(),
    phone: Joi.string()
      .pattern(/^\d{7,15}$/)
      .required()
      .messages({ "*": "Phone must be a valid phone number" }),
  });
  return schema.validate(customerObj);
};

const router = Router();

router.get("/", async (req, res) => {
  const customers = await CustomerModel.find()
    .sort("name")
    .select("username name isGold phone");
  res.send(customers);
});

router.post(
  "/",
  [authorize, validateInput(validateCustomer)],
  async (req: Request<{}, any, Customer>, res: Response) => {
    const { username, name, isGold, phone } = req.body;
    const newCustomer = await new CustomerModel({
      username,
      name,
      isGold,
      phone,
    }).save();
    res.send(newCustomer);
  },
);

router.get("/:username", async (req, res) => {
  const customer = await CustomerModel.findOne({
    username: req.params.username,
  });
  if (!customer)
    return res
      .status(status.notFound)
      .send("Customer for given username not found!");
  res.send(customer);
});

router.put(
  "/:id",
  [validateObjectId, authorize, validateInput(validateCustomer)],
  async (req: Request<{ id: string }, any, Customer>, res: Response) => {
    // Lookup and update the customer
    const { username, name, isGold, phone } = req.body;
    const customer = await CustomerModel.findByIdAndUpdate(
      req.params.id,
      { username, name, isGold, phone },
      { returnDocument: "after" },
    );
    if (!customer)
      return res
        .status(status.notFound)
        .send("Customer for given username not found!");

    res.send(customer);
  },
);

router.delete(
  "/:id",
  [validateObjectId, authorize, admin],
  async (req: Request, res: Response) => {
    // Lookup and remove the customer
    const customer = await CustomerModel.findByIdAndDelete(req.params.id, {
      returnDocument: "after",
    });
    if (!customer)
      return res
        .status(status.notFound)
        .send("Customer for given username not found!");

    res.send(customer);
  },
);

export default router;
