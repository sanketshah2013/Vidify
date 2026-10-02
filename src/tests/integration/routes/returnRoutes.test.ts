import mongoose from "mongoose";
import request from "supertest";
import { status } from "../../../util/constants.js";
import {
  CustomerModel,
  GenreModel,
  MovieModel,
  RentalModel,
  UserModel,
} from "../../../util/schemaModels.js";
import app from "../index.js";
import moment from "moment";

describe("API Suite /api/returns/", () => {
  afterEach(async () => {
    await RentalModel.deleteMany({});
    await GenreModel.deleteMany({});
    await CustomerModel.deleteMany({});
    await MovieModel.deleteMany({});
  });

  describe("POST Suite /", () => {
    let token: string;
    let customerId: string;
    let movieId: string;

    const execReq = () => {
      return request(app)
        .post("/api/returns/")
        .set("x-auth-token", token)
        .send({ customerId, movieId });
    };

    beforeEach(() => {
      token = new (UserModel as any)().generateAuthToken();
      customerId = new mongoose.Types.ObjectId().toHexString();
      movieId = new mongoose.Types.ObjectId().toHexString();
    });

    it("should return 401 when processing return without auth token", async () => {
      token = "";

      const res = await execReq();

      expect(res.status).toBe(status.unauthorised);
    });

    it("should return error 400 when processing return with invalid customer id", async () => {
      customerId = "1";
      const res = await execReq();
      expect(res.status).toBe(status.badRequest);
    });

    it("should return error 400 when processing return with invalid movie id", async () => {
      movieId = "1";
      const res = await execReq();
      expect(res.status).toBe(status.badRequest);
    });

    it("should return error 404 when rental not found", async () => {
      const res = await execReq();

      expect(res.status).toBe(status.notFound);
    });

    it("should return error 400 when return is already processed", async () => {
      const customer = await new CustomerModel({
        username: "abc123",
        name: "ABC ABC",
        phone: "1234567890",
      }).save();

      const genre = await new GenreModel({ name: "Genre1" }).save();
      const movie = await new MovieModel({
        title: "ABC",
        genre: genre._id,
        numberInStock: "1",
        dailyRentalRate: "1",
      }).save();

      await new RentalModel({
        customer,
        movie,
        dateOut: moment().subtract(10, "days").format("YYYY-MM-DD"),
        dateReturned: new Date(),
      }).save();

      customerId = customer._id.toHexString();
      movieId = movie._id.toHexString();

      const res = await execReq();
      expect(res.status).toBe(status.badRequest);
    });

    it("should return processed rental in response when valid input given", async () => {
      const customer = await new CustomerModel({
        username: "abc123",
        name: "ABC ABC",
        phone: "1234567890",
      }).save();

      const genre = await new GenreModel({ name: "Genre1" }).save();
      const movie = await new MovieModel({
        title: "ABC",
        genre: genre._id,
        numberInStock: "1",
        dailyRentalRate: "1",
      }).save();

      await new RentalModel({
        customer,
        movie,
        dateOut: moment().subtract(10, "days").format("YYYY-MM-DD"),
      }).save();

      customerId = customer._id.toHexString();
      movieId = movie._id.toHexString();

      const res = await execReq();
      expect(res.status).toBe(status.ok);
      expect(res.body.rentalFee).toBe(10); // 10days * 1dailyRentalRate

      const movieInDb = await MovieModel.findById(movie._id);
      expect(movieInDb?.numberInStock).toBe(2);
    });
  });
});
