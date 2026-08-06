import { Response } from "express";
import { customerNames, genreNames } from "./constants.js";
import { CustomerModel, GenreModel } from "./schemaModels.js";

const getGenreCount = async (): Promise<number | undefined> => {
  try {
    const count = await GenreModel.estimatedDocumentCount();
    console.log("Existing Genres in DB:", count);
    return count;
  } catch (error) {
    console.error(error);
  }
};

const createGenres = async (force: boolean) => {
  if (!force) {
    const genreCount = await getGenreCount();
    if (genreCount) return;
  }

  const genreData: Genre[] = genreNames.map((name) => ({
    name,
    description: `All ${name} Movies`,
    slug: `http://${name.toLowerCase()}sampleURI`,
  }));

  GenreModel.insertMany(genreData)
    .then((resp) =>
      console.log("Initial Genre Data load Success! Total Data:", resp.length),
    )
    .catch((err) => console.error(err));
};

const getCustomerCount = async (): Promise<number | undefined> => {
  try {
    const count = await CustomerModel.estimatedDocumentCount();
    console.log("Existing Customers in DB:", count);
    return count;
  } catch (error) {
    console.error(error);
  }
};

const createCustomers = async (force: boolean) => {
  if (!force) {
    const customerCount = await getCustomerCount();
    if (customerCount) return;
  }

  const customerData: Customer[] = customerNames.map((name, index) => ({
    username: name.split(" ")[0] + "123",
    name,
    isGold: index % 5 === 0,
    phone: Math.floor(Math.random() * 9000000000) + 1000000000, // random 10digit number
  }));

  CustomerModel.insertMany(customerData)
    .then((resp) =>
      console.log(
        "Initial Customer Data load Success! Total Data:",
        resp.length,
      ),
    )
    .catch((err) => console.error(err));
};

export const createInitialData = (force: boolean = false) => {
  createGenres(force);
  createCustomers(force);
};

export const handleDBErrors = (res: Response, err: unknown) => {
  console.error("MongoDB Error:", err);
  res.status(500).send(err);
};
