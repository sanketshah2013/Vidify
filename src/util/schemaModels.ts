import mongoose from "mongoose";

const genreSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  slug: String,
});

export const GenreModel = mongoose.model("Genre", genreSchema);
