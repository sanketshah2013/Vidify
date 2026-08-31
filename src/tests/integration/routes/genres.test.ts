import mongoose from "mongoose";
import request from "supertest";
import { status } from "../../../util/constants.js";
import { GenreModel, UserModel } from "../../../util/schemaModels.js";
import app from "../index.js";

describe("API Suite: /api/genres/", () => {
  afterEach(async () => {
    await GenreModel.deleteMany({});
  });

  describe("GET Suite: /", () => {
    it("should return all genres", async () => {
      await GenreModel.collection.insertMany([
        { name: "Genre1" },
        { name: "Genre2" },
      ]);

      const res = await request(app).get("/api/genres/");
      expect(res.status).toBe(status.ok);
      expect(res.body.some((g: any) => g.name === "Genre1")).toBeTruthy();
      expect(res.body.some((g: any) => g.name === "Genre2")).toBeTruthy();
    });
  });

  describe("GET Suite: /:id", () => {
    let id = "";

    const execReq = () => {
      return request(app).get("/api/genres/" + id);
    };

    it("should get a genre if valid genre id is passed", async () => {
      const genre = await new GenreModel({ name: "Genre1" }).save();
      id = genre._id.toHexString();

      const res = await execReq();
      expect(res.status).toBe(status.ok);
      expect(res.body).toHaveProperty("name", genre.name);
    });

    it("should return 400 error if invalid genre id is passed", async () => {
      id = "1";
      const res = await execReq();
      expect(res.status).toBe(status.badRequest);
    });

    it("should return 404 error if genre not found", async () => {
      id = new mongoose.Types.ObjectId().toHexString();
      const res = await execReq();
      expect(res.status).toBe(status.notFound);
    });
  });

  describe("POST Suite: /", () => {
    let token: string;
    let name: string;

    const execReq = () => {
      return request(app)
        .post("/api/genres/")
        .set("x-auth-token", token)
        .send({ name });
    };

    beforeEach(() => {
      token = new (UserModel as any)().generateAuthToken();
      name = "Genre1";
    });

    it("should give 401 error when creating new genre without jwt auth token", async () => {
      token = "";
      const res = await execReq();
      expect(res.status).toBe(status.unauthorised);
    });

    it("should give 400 error when creating new genre with invalid inputs", async () => {
      // Scenario 1: name length less than 2
      name = "A";
      const res1 = await execReq();
      expect(res1.status).toBe(status.badRequest);

      // Scenario 2: name length more than 15
      name = new Array(17).join("a");
      const res2 = await execReq();
      expect(res2.status).toBe(status.badRequest);

      // Scenario 3: description has special characters
      const res3 = await request(app)
        .post("/api/genres/")
        .set("x-auth-token", token)
        .send({ name: "Genre1", description: "@$#" });
      expect(res3.status).toBe(status.badRequest);
    });

    it("should save the genre in db and return it back in response", async () => {
      const res = await execReq();

      // Validate if genre saved in DB
      const genre = await GenreModel.find({ name: "Genre1" });
      expect(genre).not.toBeNull();

      // Validate if genre is returned in server response
      expect(res.status).toBe(status.ok);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "Genre1");
    });
  });
});
