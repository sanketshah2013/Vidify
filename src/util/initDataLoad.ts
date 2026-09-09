import { Document } from "mongoose";
import { customerNames, genreNames, movies } from "./constants.js";
import { CustomerModel, GenreModel, MovieModel } from "./schemaModels.js";

const getAllGenres = async (): Promise<
  Document<any, any, Genre>[] | undefined
> => {
  try {
    const genres = (await GenreModel.find()) as Document<any, any, Genre>[];
    console.info(`Existing Genres in DB: ${genres.length}`);
    return genres;
  } catch (error) {
    console.error(error);
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

  try {
    const resp = await GenreModel.insertMany(genreData);
    console.info(`Initial Genre Data load Success! Total Data: ${resp.length}`);
  } catch (err) {
    console.error(err);
  }
};

const getCustomerCount = async (): Promise<number | undefined> => {
  try {
    const count = await CustomerModel.estimatedDocumentCount();
    console.info(`Existing Customers in DB: ${count}`);
    return count;
  } catch (error) {
    console.error(error);
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

  try {
    const resp = await CustomerModel.insertMany(customerData);
    console.info(
      `Initial Customer Data load Success! Total Data: ${resp.length}`,
    );
  } catch (err) {
    console.error(err);
  }
};

const getMovieCount = async (): Promise<number | undefined> => {
  try {
    const count = await MovieModel.estimatedDocumentCount();
    console.info(`Existing Movies in DB: ${count}`);
    return count;
  } catch (error) {
    console.error(error);
  }
};

const createMovies = async () => {
  const movieCount = await getMovieCount();
  if (movieCount) return;

  const genres = (await getAllGenres()) as any;
  const movieData: Movie[] = movies.map(({ title, genre }) => ({
    title,
    genre: genres
      ?.filter((dbGenre: any) => dbGenre.name === "Action")
      .map(({ _id, name }: any) => ({ _id, name }))[0],
    numberInStock: Math.floor(Math.random() * 100),
    dailyRentalRate: Math.floor(Math.random() * 100),
  }));

  try {
    const resp = await MovieModel.insertMany(movieData);
    console.info(`Initial Movie Data load Success! Total Data: ${resp.length}`);
  } catch (err) {
    console.error(err);
  }
};

export const createInitialData = () => {
  createGenres();
  createCustomers();
  createMovies();
};
