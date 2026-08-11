import { Response } from "express";
import { customerNames, genreNames, movies } from "./constants.js";
import { CustomerModel, GenreModel, MovieModel } from "./schemaModels.js";
import { Document } from "mongoose";

const getAllGenres = async (): Promise<
  Document<any, any, Genre>[] | undefined
> => {
  try {
    const genres = (await GenreModel.find()) as Document<any, any, Genre>[];
    console.log("Existing Genres in DB:", genres.length);
    return genres;
  } catch (error) {
    console.error(error);
  }
};

const createGenres = async (force: boolean) => {
  if (!force) {
    const genreCount = await getAllGenres();
    if (genreCount?.length) return;
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

const getMovieCount = async (): Promise<number | undefined> => {
  try {
    const count = await MovieModel.estimatedDocumentCount();
    console.log("Existing Movies in DB:", count);
    return count;
  } catch (error) {
    console.error(error);
  }
};

const createMovies = async (force: boolean) => {
  if (!force) {
    const movieCount = await getMovieCount();
    if (movieCount) return;
  }

  const genres = (await getAllGenres()) as any;
  const movieData: Movie[] = movies.map(({ title, genre }) => ({
    title,
    genre: genres
      ?.filter((dbGenre) => genre === dbGenre.name)
      .map(({ _id, name }) => ({ _id, name }))[0],
    numberInStock: Math.floor(Math.random() * 100),
    dailyRentalRate: Math.floor(Math.random() * 100),
  }));

  MovieModel.insertMany(movieData)
    .then((resp) =>
      console.log("Initial Movie Data load Success! Total Data:", resp.length),
    )
    .catch((err) => console.error(err));
};

export const createInitialData = (force: boolean = false) => {
  createGenres(force);
  createCustomers(force);
  createMovies(force);
};

export const handleDBErrors = (res: Response, err: unknown) => {
  console.error("MongoDB Error:", err);
  res.status(500).send(err);
};
