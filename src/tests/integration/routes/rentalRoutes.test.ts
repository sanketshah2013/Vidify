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

describe("API Suite /api/rentals/", () => {
  afterEach(async () => {
    await RentalModel.deleteMany({});
    await GenreModel.deleteMany({});
    await CustomerModel.deleteMany({});
    await MovieModel.deleteMany({});
  });

  describe("GET Suite /", () => {
    it("should get all rentals", async () => {
      await RentalModel.insertMany([
        {
          customer: { name: "Customer Customer", phone: "1234567890" },
          movie: { title: "Movie1", dailyRentalRate: "1" },
        },
        {
          customer: { name: "Customer Customer", phone: "1234567890" },
          movie: { title: "Movie2", dailyRentalRate: "1" },
        },
      ]);

      const res = await request(app).get("/api/rentals/");
      expect(res.status).toBe(status.ok);

      expect(
        res.body.some((r: any) => r.customer.name === "Customer Customer"),
      ).toBeTruthy();

      expect(
        res.body.some((r: any) => r.movie.title === "Movie1"),
      ).toBeTruthy();

      expect(
        res.body.some((r: any) => r.movie.title === "Movie2"),
      ).toBeTruthy();
    });
  });

  describe("GET Suite /:id", () => {
    it("should return error 400 when invalid id given", async () => {
      const res = await request(app).get("/api/rentals/1");
      expect(res.status).toBe(status.badRequest);
    });

    it("should return error 404 when rental not found", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await request(app).get("/api/rentals/" + id);
      expect(res.status).toBe(status.notFound);
    });

    it("should return rental for given id", async () => {
      const rental = await new RentalModel({
        customer: { name: "Customer Customer", phone: "1234567890" },
        movie: { title: "Movie1", dailyRentalRate: "1" },
      }).save();

      const res = await request(app).get("/api/rentals/" + rental.id);
      expect(res.body).toHaveProperty("customer.name", rental.customer.name);
    });
  });

  describe("POST Suite /", () => {
    let token: string;
    let customerId: string;
    let movieId: string;

    const execReq = () => {
      return request(app)
        .post("/api/rentals/")
        .set("x-auth-token", token)
        .send({ customerId, movieId });
    };

    beforeEach(() => {
      token = new (UserModel as any)().generateAuthToken();
      customerId = new mongoose.Types.ObjectId().toHexString();
      movieId = new mongoose.Types.ObjectId().toHexString();
    });

    it("should return 401 when creating new rental without auth token", async () => {
      token = "";

      const res = await execReq();

      expect(res.status).toBe(status.unauthorised);
    });

    it("should return error 400 when creating rental with invalid customer id", async () => {
      // Scenario 1: length less than 1
      customerId = "1";
      const res = await execReq();
      expect(res.status).toBe(status.badRequest);
    });

    it("should return error 404 when creating rental but customer not found for given id", async () => {
      const res = await execReq();

      expect(res.status).toBe(status.notFound);
    });

    it("should return error 404 when creating rental but movie not found for given id", async () => {
      const customer = await new CustomerModel({
        username: "abc123",
        name: "ABC ABC",
        phone: "1234567890",
      }).save();

      customerId = customer._id.toHexString();
      const res = await execReq();

      expect(res.status).toBe(status.notFound);
    });

    it("should return error 400 when creating rental but movie not in stock", async () => {
      const customer = await new CustomerModel({
        username: "abc123",
        name: "ABC ABC",
        phone: "1234567890",
      }).save();

      const genre = await new GenreModel({ name: "Genre1" }).save();
      const movie = await new MovieModel({
        title: "ABC",
        genre: genre._id,
        numberInStock: "0",
        dailyRentalRate: "1",
      }).save();

      customerId = customer._id.toHexString();
      movieId = movie._id.toHexString();

      const res = await execReq();
      expect(res.status).toBe(status.badRequest);
      expect(res.text.toLowerCase()).toContain("not in stock");
    });

    it("should return new rental in response when valid input given", async () => {
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

      customerId = customer._id.toHexString();
      movieId = movie._id.toHexString();

      const res = await execReq();
      expect(res.status).toBe(status.ok);
      expect(res.body.movie).toHaveProperty("title", movie.title);

      const movieInDb = await MovieModel.findById(movie._id);
      expect(movieInDb?.numberInStock).toBe(0);
    });
  });

  describe("PUT Suite /:id", () => {
    let token: string;
    let id: string;
    let dateReturned: string;
    let rentalFee: number;

    const execReq = () => {
      return request(app)
        .put("/api/rentals/" + id)
        .set("x-auth-token", token)
        .send({ dateReturned, rentalFee });
    };

    beforeEach(() => {
      token = new (UserModel as any)().generateAuthToken();
      id = new mongoose.Types.ObjectId().toHexString();
      dateReturned = "2026-01-01 12:00";
      rentalFee = 1;
    });

    it("should return error 400 when updating rental with invalid id", async () => {
      id = "1";

      const res = await execReq();

      expect(res.status).toBe(status.badRequest);
    });

    it("should return error 401 when updating rental with invalid auth token", async () => {
      token = "";

      const res = await execReq();

      expect(res.status).toBe(status.unauthorised);
    });

    it("should return error 404 when rental for given id not found", async () => {
      const res = await execReq();

      expect(res.status).toBe(status.notFound);
    });

    it("should return error 400 when updating rental with invalid dateReturned", async () => {
      // Scenario 1: not a date
      dateReturned = "a";
      const res1 = await execReq();
      expect(res1.status).toBe(status.badRequest);

      // Scenario 2: future date
      dateReturned = new Date(new Date().setFullYear(3000)).toISOString();
      const res2 = await execReq();
      expect(res2.status).toBe(status.badRequest);
    });

    it("should return error 400 when updating rental with invalid rentalFee", async () => {
      // Scenario 1: not a number
      rentalFee = "a" as any;
      const res1 = await execReq();
      expect(res1.status).toBe(status.badRequest);

      // Scenario 2: less than 0
      rentalFee = -1;
      const res2 = await execReq();
      expect(res2.status).toBe(status.badRequest);
    });

    it("should update rental in db with new values and return it in response", async () => {
      const rental = await new RentalModel({
        customer: { name: "Customer Customer", phone: "1234567890" },
        movie: { title: "Movie1", dailyRentalRate: "1" },
      }).save();

      id = rental._id.toHexString();

      const res = await execReq();

      const rentalInDb = await RentalModel.findById(id);
      expect(rentalInDb).toHaveProperty("_id", rental._id);

      expect(res.body._id).toBe(rental._id.toHexString());
    });
  });

  describe("DELETE Suite /:id", () => {
    let token: string;
    let id: string;

    const execReq = () => {
      return request(app)
        .delete("/api/rentals/" + id)
        .set("x-auth-token", token);
    };

    beforeEach(() => {
      token = new (UserModel as any)({ isAdmin: true }).generateAuthToken();
      id = new mongoose.Types.ObjectId().toHexString();
    });

    it("should return error 403 if token is not of admin user", async () => {
      token = new (UserModel as any)().generateAuthToken();

      const res = await execReq();

      expect(res.status).toBe(status.forbidden);
    });

    it("should return error 404 when movie for given ID not found", async () => {
      const res = await execReq();
      expect(res.status).toBe(status.notFound);
    });

    it("should delete the movie from db and return deleted movie obj in response", async () => {
      const rental = await new RentalModel({
        customer: { name: "Customer Customer", phone: "1234567890" },
        movie: { title: "Movie1", dailyRentalRate: "1" },
      }).save();

      id = rental._id.toHexString();

      const res = await execReq();

      const checkRentalinDB = await RentalModel.findById(id);
      expect(checkRentalinDB).toBeNull();

      expect(res.body.movie).toHaveProperty("title", rental.movie.title);
    });
  });
});
