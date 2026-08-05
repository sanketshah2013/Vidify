import { Document } from "mongoose";
import { genreNames } from "./constants.js";
import { GenreModel } from "./schemaModels.js";

const createGenres = () => {
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

const getAllGenres = async (): Promise<
  Document<any, any, Genre>[] | undefined
> => {
  try {
    return await GenreModel.find()
      .sort({ name: 1 })
      .select({ name: 1, description: 1, slug: 1 });
  } catch (error) {
    console.error(error);
  }
};

export const createInitialData = async (force: boolean = false) => {
  if (!force) {
    const existingData = await getAllGenres();
    console.log(
      "Count of Existing Data fetched from DB:",
      existingData?.length,
    );
    if (existingData?.length) return;
  }
  console.log("Creating initial data into DB.");
  createGenres();
};
