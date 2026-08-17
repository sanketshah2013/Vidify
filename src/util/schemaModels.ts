import config from "config";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const GenreSchema = new mongoose.Schema({
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
});

export const GenreModel = mongoose.model("genres", GenreSchema);

export const CustomerModel = mongoose.model(
  "customers",
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

export const MovieModel = mongoose.model(
  "movies",
  new mongoose.Schema({
    title: {
      type: String,
      trim: true, // Remove leading and trailing whitespaces automatically
      maxLength: 50,
      match: [/^[a-zA-Z0-9 ]+$/, "Only Alphanuerics and Spaces allowed"],
      unique: true,
      required: true,
    },
    genre: { type: GenreSchema, required: true },
    numberInStock: {
      type: Number,
      minLength: 0,
      maxLength: 10,
      required: true,
    },
    dailyRentalRate: {
      type: Number,
      minLength: 0,
      maxLength: 10,
      required: true,
    },
  }),
);

export const RentalModel = mongoose.model(
  "rentals",
  new mongoose.Schema({
    customer: {
      type: new mongoose.Schema({
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
      required: true,
    },
    movie: {
      type: new mongoose.Schema({
        title: {
          type: String,
          trim: true, // Remove leading and trailing whitespaces automatically
          maxLength: 50,
          match: [/^[a-zA-Z0-9 ]+$/, "Only Alphanuerics and Spaces allowed"],
          unique: true,
          required: true,
        },
        dailyRentalRate: {
          type: Number,
          minLength: 0,
          maxLength: 10,
          required: true,
        },
      }),
      required: true,
    },
    dateOut: { type: Date, required: true, default: Date.now },
    dateReturned: {
      type: Date,
      validate: {
        validator: function (value: Date) {
          console.log("value", value);
          console.log("this.dateOut", this.dateOut);
          return value > this.dateOut;
        },
        message: () => "value cannot be less than 'dateOut' value",
      },
    },
    rentalFee: { type: Number, min: 0 },
  }),
);

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    minLength: 3,
    maxLength: 20,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please fill a valid email address",
    ],
    required: true,
  },
  password: {
    type: String,
    trim: true,
    maxLength: 100,
    required: true,
  },
  isAdmin: Boolean,
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    config.get("jwtPrivateKey") as string,
    { expiresIn: "15m" },
  );
};

export const UserModel = mongoose.model("users", userSchema);
