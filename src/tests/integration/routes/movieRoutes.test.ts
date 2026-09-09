import mongoose from "mongoose";
import request from "supertest";
import { status } from "../../../util/constants.js";
import {
  GenreModel,
  MovieModel,
  UserModel,
} from "../../../util/schemaModels.js";
import app from "../index.js";

describe("API Suite /api/movies/", () => {
  afterEach(async () => {
    await MovieModel.deleteMany({});
    await GenreModel.deleteMany({});
  });

  describe("GET Suite /", () => {
    it("should get all movies", async () => {
      const genre = await new GenreModel({ name: "Genre1" }).save();
      await MovieModel.insertMany([
        {
          title: "ABC",
          genre: genre._id,
          numberInStock: "1",
          dailyRentalRate: "1",
        },
        {
          title: "XYZ",
          genre: genre._id,
          numberInStock: "1",
          dailyRentalRate: "1",
        },
      ]);

      const res = await request(app).get("/api/movies/");
      expect(res.status).toBe(status.ok);
      expect(res.body.some((c: any) => c.title === "ABC")).toBeTruthy();
      expect(res.body.some((c: any) => c.title === "XYZ")).toBeTruthy();
    });
  });

  describe("GET Suite /:id", () => {
    it("should return error 400 when invalid id given", async () => {
      const res = await request(app).get("/api/movies/1");
      expect(res.status).toBe(status.badRequest);
    });

    it("should return error 404 when movie not found", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await request(app).get("/api/movies/" + id);
      expect(res.status).toBe(status.notFound);
    });

    it("should return movie for given id", async () => {
      const genre = await new GenreModel({ name: "Genre1" }).save();
      const movie = await new MovieModel({
        title: "ABC",
        genre: genre._id,
        numberInStock: "1",
        dailyRentalRate: "1",
      }).save();

      const res = await request(app).get("/api/movies/" + movie.id);
      expect(res.body).toHaveProperty("title", movie.title);
    });
  });

  describe("POST Suite /", () => {
    let token: string;
    let title: string;
    let genreId: string;
    let numberInStock: string;
    let dailyRentalRate: string;

    const execReq = () => {
      return request(app)
        .post("/api/movies/")
        .set("x-auth-token", token)
        .send({ title, genreId, numberInStock, dailyRentalRate });
    };

    beforeEach(() => {
      token = new (UserModel as any)().generateAuthToken();
      title = "abc123";
      genreId = new mongoose.Types.ObjectId().toHexString();
      numberInStock = "1";
      dailyRentalRate = "1";
    });

    it("should return 401 when creating new movie without auth token", async () => {
      token = "";

      const res = await execReq();

      expect(res.status).toBe(status.unauthorised);
    });

    it("should return error 400 when creating movie with invalid title", async () => {
      // Scenario 1: length less than 1
      title = "";
      const res1 = await execReq();
      expect(res1.status).toBe(status.badRequest);

      // Scenario 2: length more than 50
      title = "a".repeat(51);
      const res2 = await execReq();
      expect(res2.status).toBe(status.badRequest);

      // Scenario 3: does not match rule: no special characters
      title = "@#!$";
      const res3 = await execReq();
      expect(res3.status).toBe(status.badRequest);
    });

    it("should return error 400 when creating movie with invalid genreId", async () => {
      genreId = "1";

      const res = await execReq();

      expect(res.status).toBe(status.badRequest);
    });

    it("should return error 404 when genre not found for given id", async () => {
      const res = await execReq();

      expect(res.status).toBe(status.notFound);
    });

    it("should return error 400 when creating movie with invalid numberInStock", async () => {
      // Scenario 1: length less than 1
      numberInStock = "";
      const res1 = await execReq();
      expect(res1.status).toBe(status.badRequest);

      // Scenario 2: length more than 10
      numberInStock = "a".repeat(11);
      const res2 = await execReq();
      expect(res2.status).toBe(status.badRequest);

      // Scenario 3: does not match rule: numbers only
      numberInStock = "abc";
      const res3 = await execReq();
      expect(res3.status).toBe(status.badRequest);
    });

    it("should return error 400 when creating movie with invalid dailyRentalRate", async () => {
      // Scenario 1: length less than 1
      dailyRentalRate = "";
      const res1 = await execReq();
      expect(res1.status).toBe(status.badRequest);

      // Scenario 2: length more than 10
      dailyRentalRate = "1".repeat(11);
      const res2 = await execReq();
      expect(res2.status).toBe(status.badRequest);

      // Scenario 3: does not match rule: numbers only
      dailyRentalRate = "abc";
      const res3 = await execReq();
      expect(res3.status).toBe(status.badRequest);
    });

    it("should return new movie in response when valid input given", async () => {
      const genre = await new GenreModel({ name: "Genre1" }).save();
      genreId = genre._id.toHexString();

      const res = await execReq();
      expect(res.status).toBe(status.ok);
      expect(res.body._id).toBeDefined();
      expect(res.body.title).toBe(title);
    });
  });

  describe("PUT Suite /:id", () => {
    let token: string;
    let title: string;
    let genreId: string;
    let numberInStock: string;
    let dailyRentalRate: string;
    let id: string;

    const execReq = () => {
      return request(app)
        .put("/api/movies/" + id)
        .set("x-auth-token", token)
        .send({ title, genreId, numberInStock, dailyRentalRate });
    };

    beforeEach(() => {
      token = new (UserModel as any)().generateAuthToken();
      id = new mongoose.Types.ObjectId().toHexString();
      title = "abc123";
      genreId = new mongoose.Types.ObjectId().toHexString();
      numberInStock = "1";
      dailyRentalRate = "1";
    });

    it("should return error 400 when updating movie with invalid id", async () => {
      id = "1";

      const res = await execReq();

      expect(res.status).toBe(status.badRequest);
    });

    it("should return error 401 when updating movie with invalid auth token", async () => {
      token = "";

      const res = await execReq();

      expect(res.status).toBe(status.unauthorised);
    });

    it("should return error 404 when genre from input request is not found in db", async () => {
      const res = await execReq();

      expect(res.status).toBe(status.notFound);
    });

    it("should return error 404 when movie for given id not found", async () => {
      const genre = await new GenreModel({ name: "Genre1" }).save();
      genreId = genre._id.toHexString();

      const res = await execReq();

      expect(res.status).toBe(status.notFound);
    });

    it("should update movie in db with new values and return it in response", async () => {
      const genre = await new GenreModel({ name: "Genre1" }).save();
      genreId = genre._id.toHexString();

      const movie = await new MovieModel({
        title,
        genre: genreId,
        numberInStock,
        dailyRentalRate,
      }).save();

      id = movie._id.toHexString();
      title = "xyz456";

      const res = await execReq();

      const movieInDb = await MovieModel.findById(id);
      expect(movieInDb).toHaveProperty("title", title);

      expect(res.body.title).toBe(title);
    });
  });

  describe("DELETE Suite /:id", () => {
    let token: string;
    let id: string;

    const execReq = () => {
      return request(app)
        .delete("/api/movies/" + id)
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
      const genre = await new GenreModel({ name: "Genre1" }).save();

      const movie = await new MovieModel({
        title: "ABC",
        genre: genre._id,
        numberInStock: "1",
        dailyRentalRate: "1",
      }).save();

      id = movie._id.toHexString();

      const res = await execReq();

      const checkMovieinDB = await MovieModel.findById(id);
      expect(checkMovieinDB).toBeNull();

      expect(res.body).toHaveProperty("title", movie.title);
    });
  });
});
