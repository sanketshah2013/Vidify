import mongoose from "mongoose";

export const GenreModel = mongoose.model(
  "Genre",
  new mongoose.Schema({
    name: {
      type: String,
      trim: true, // Remove leading and trailing whitespaces automatically
      minLength: 2,
      maxLength: 15,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true, // Remove leading and trailing whitespaces automatically
      maxLength: 20,
      match: [/^[a-zA-Z0-9 ]+$/, "Only Alphanuerics and Spaces allowed"],
    },
    slug: { type: String, trim: true },
  }),
);

export const CustomerModel = mongoose.model(
  "Customer",
  new mongoose.Schema({
    username: {
      type: String,
      trim: true, // Remove leading and trailing whitespaces automatically
      minLength: 3,
      maxLength: 15,
      lowercase: true,
      match: [
        /^[a-z0-9_-]+$/,
        "Username can only contain letters, numbers, underscores, and hyphens.",
      ],
      required: true,
      unique: true,
    },
    name: {
      type: String,
      trim: true, // Remove leading and trailing whitespaces automatically
      minLength: 3,
      maxLength: 20,
      match: [
        /^[a-zA-Z]+(?:\s+[a-zA-Z]+)+$/,
        "Require both first and last name (letters only).",
      ],
      required: true,
    },
    isGold: { type: Boolean, default: false },
    phone: {
      type: Number,
      required: true,
      minLength: 7,
      maxLength: 15,
    },
  }),
);
