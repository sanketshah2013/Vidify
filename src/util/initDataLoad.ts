import { Document } from "mongoose";
import { customerNames, genreNames, movies } from "./constants.js";
import { CustomerModel, GenreModel, MovieModel } from "./schemaModels.js";
import logger from "../startup/logger.js";

const getAllGenres = async (): Promise<
  Document<any, any, Genre>[] | undefined
> => {
  try {
    const genres = (await GenreModel.find()) as Document<any, any, Genre>[];
    logger.info(`Existing Genres in DB: ${genres.length}`);
    return genres;
  } catch (error) {
    logger.error(error);
  }
};

const createGenres = async () => {
  const genreCount = await getAllGenres();
  if (genreCount?.length) return;

  const genreData: Genre[] = genreNames.map((name) => ({
    name,
    description: `All ${name} Movies`,
    slug: `http://${name.toLowerCase()}sampleURI`,
  }));

  GenreModel.insertMany(genreData)
    .then((resp) =>
      logger.info(
        `Initial Genre Data load Success! Total Data: ${resp.length}`,
      ),
    )
    .catch((err) => logger.error(err));
};

const getCustomerCount = async (): Promise<number | undefined> => {
  try {
    const count = await CustomerModel.estimatedDocumentCount();
    logger.info(`Existing Customers in DB: ${count}`);
    return count;
  } catch (error) {
    logger.error(error);
  }
};

const createCustomers = async () => {
  const customerCount = await getCustomerCount();
  if (customerCount) return;

  const customerData: Customer[] = customerNames.map((name, index) => ({
    username: name.split(" ")[0] + "123",
    name,
    isGold: index % 5 === 0,
    phone: Math.floor(Math.random() * 9000000000) + 1000000000, // random 10digit number
  }));

  CustomerModel.insertMany(customerData)
    .then((resp) =>
      logger.info(
        `Initial Customer Data load Success! Total Data: ${resp.length}`,
      ),
    )
    .catch((err) => logger.error(err));
};

const getMovieCount = async (): Promise<number | undefined> => {
  try {
    const count = await MovieModel.estimatedDocumentCount();
    logger.info(`Existing Movies in DB: ${count}`);
    return count;
  } catch (error) {
    logger.error(error);
  }
};

const createMovies = async () => {
  const movieCount = await getMovieCount();
  if (movieCount) return;

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
      logger.info(
        `Initial Movie Data load Success! Total Data: ${resp.length}`,
      ),
    )
    .catch((err) => logger.error(err));
};

export const createInitialData = () => {
  createGenres();
  createCustomers();
  createMovies();
};
