import Router, { Request, Response } from "express";
import Joi from "joi";
import { CustomerModel } from "../util/schemaModels.js";
import { handleDBErrors } from "../util/initDataLoad.js";
import authorize from "../middlewares/authorize.js";
import admin from "../middlewares/admin.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const customers = await CustomerModel.find()
      .sort("name")
      .select("username name isGold phone");
    res.send(customers);
  } catch (err) {
    handleDBErrors(res, err);
  }
});

router.post("/", authorize, async (req: Request<{}, any, Customer>, res) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { username, name, isGold, phone } = req.body;
  try {
    const newCustomer = await new CustomerModel({
      username,
      name,
      isGold,
      phone,
    }).save();
    res.send(newCustomer);
  } catch (err) {
    handleDBErrors(res, err);
  }
});

router.get("/:username", async (req, res) => {
  try {
    const customer = await CustomerModel.findOne({
      username: req.params.username,
    });
    if (!customer)
      res.status(404).send("Customer for given username not found!");
    res.send(customer);
  } catch (err) {
    handleDBErrors(res, err);
  }
});

router.put(
  "/:id",
  authorize,
  async (req: Request<{ id: string }, any, Customer>, res) => {
    // Validate the input
    const { error } = validateCustomer(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Lookup and update the customer
    try {
      const { username, name, isGold, phone } = req.body;
      const customer = await CustomerModel.findOneAndUpdate(
        { username: req.params.id },
        { username, name, isGold, phone },
        { returnDocument: "after" },
      );
      if (!customer)
        return res.status(404).send("Customer for given username not found!");

      res.send(customer);
    } catch (err) {
      handleDBErrors(res, err);
    }
  },
);

router.delete(
  "/:id",
  [authorize, admin],
  async (req: Request, res: Response) => {
    // Lookup and remove the customer
    try {
      const customer = await CustomerModel.findOneAndDelete(
        { username: req.params.id },
        { returnDocument: "after" },
      );
      if (!customer)
        return res.status(404).send("Customer for given username not found!");

      res.send(customer);
    } catch (err) {
      handleDBErrors(res, err);
    }
  },
);

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

export default router;
