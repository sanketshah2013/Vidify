import mongoose from "mongoose";
import request from "supertest";
import { status } from "../../../util/constants.js";
import { CustomerModel, UserModel } from "../../../util/schemaModels.js";
import app from "../index.js";

describe("API Suite /api/customers/", () => {
  afterEach(async () => {
    await CustomerModel.deleteMany({});
  });

  describe("GET Suite /", () => {
    it("should get all customers", async () => {
      await CustomerModel.insertMany([
        { username: "abc123", name: "ABC ABC", phone: "1234567890" },
        { username: "xyz123", name: "XYZ XYZ", phone: "1234567890" },
      ]);

      const res = await request(app).get("/api/customers/");
      expect(res.status).toBe(status.ok);
      expect(res.body.some((c: any) => c.name === "ABC ABC")).toBeTruthy();
      expect(res.body.some((c: any) => c.name === "XYZ XYZ")).toBeTruthy();
    });
  });

  describe("GET Suite /:username", () => {
    it("should return error 404 when customer not found", async () => {
      const res = await request(app).get("/api/customers/user1");
      expect(res.status).toBe(status.notFound);
    });

    it("should return customer for given username", async () => {
      const customer = await new CustomerModel({
        username: "abc123",
        name: "ABC ABC",
        phone: 1234567890,
      }).save();

      const res = await request(app).get("/api/customers/" + customer.username);
      expect(res.body).toHaveProperty("name", customer.name);
    });
  });

  describe("POST Suite /", () => {
    let token: string;
    let username: string;
    let name: string;
    let phone: string;

    const execReq = () => {
      return request(app)
        .post("/api/customers/")
        .set("x-auth-token", token)
        .send({ username, name, phone });
    };

    beforeEach(() => {
      token = new (UserModel as any)().generateAuthToken();
      username = "abc123";
      name = "ABC ABC";
      phone = "1234567890";
    });

    it("should return 401 when creating new customer without auth token", async () => {
      token = "";

      const res = await execReq();

      expect(res.status).toBe(status.unauthorised);
    });

    it("should return error 400 when creating customer with invalid username", async () => {
      // Scenario 1: length less than 3
      username = "a";
      const res1 = await execReq();
      expect(res1.status).toBe(status.badRequest);

      // Scenario 2: length more than 15
      username = "a".repeat(16);
      const res2 = await execReq();
      expect(res2.status).toBe(status.badRequest);

      // Scenario 3: does not match rule: lowercase only
      username = "AAA";
      const res3 = await execReq();
      expect(res3.status).toBe(status.badRequest);

      // Scenario 4: does not match rule: no special character except hyphen and underscore
      username = "@#!$";
      const res4 = await execReq();
      expect(res4.status).toBe(status.badRequest);

      // Scenario 5: username is empty
      username = "";
      const res5 = await execReq();
      expect(res5.status).toBe(status.badRequest);
    });

    it("should return error 400 when creating customer with invalid name", async () => {
      // Scenario 1: length less than 3
      name = "a";
      const res1 = await execReq();
      expect(res1.status).toBe(status.badRequest);

      // Scenario 2: length more than 20
      name = "a".repeat(21);
      const res2 = await execReq();
      expect(res2.status).toBe(status.badRequest);

      // Scenario 3: does not match rule: letters only
      name = "1234";
      const res3 = await execReq();
      expect(res3.status).toBe(status.badRequest);

      // Scenario 4: does not match rule: both first and last name required
      name = "ABC";
      const res4 = await execReq();
      expect(res4.status).toBe(status.badRequest);

      // Scenario 5: name is empty
      name = "";
      const res5 = await execReq();
      expect(res5.status).toBe(status.badRequest);
    });

    it("should return error 400 when creating customer with invalid phone", async () => {
      // Scenario 1: length less than 7
      phone = "123";
      const res1 = await execReq();
      expect(res1.status).toBe(status.badRequest);

      // Scenario 2: length more than 15
      phone = "1".repeat(16);
      const res2 = await execReq();
      expect(res2.status).toBe(status.badRequest);

      // Scenario 3: does not match rule: no letters allowed
      phone = "ABC";
      const res3 = await execReq();
      expect(res3.status).toBe(status.badRequest);

      // Scenario 5: phone is empty
      phone = "";
      const res5 = await execReq();
      expect(res5.status).toBe(status.badRequest);
    });

    it("should return new customer in response when valid input given", async () => {
      const res = await execReq();
      expect(res.status).toBe(status.ok);
      expect(res.body._id).toBeDefined();
      expect(res.body.username).toBe(username);
    });
  });

  describe("PUT Suite /:id", () => {
    let token: string;
    let username: string;
    let name: string;
    let phone: string;
    let id: string;

    const execReq = () => {
      return request(app)
        .put("/api/customers/" + id)
        .set("x-auth-token", token)
        .send({ username, name, phone });
    };

    beforeEach(() => {
      token = new (UserModel as any)().generateAuthToken();
      id = new mongoose.Types.ObjectId().toHexString();
      username = "abc123";
      name = "ABC ABC";
      phone = "1234567890";
    });

    it("should return error 400 when updating customer with invalid id", async () => {
      id = "1";

      const res = await execReq();

      expect(res.status).toBe(status.badRequest);
    });

    it("should return error 401 when updating customer with invalid auth token", async () => {
      token = "";

      const res = await execReq();

      expect(res.status).toBe(status.unauthorised);
    });

    it("should return error 404 when customer for given id not found", async () => {
      const res = await execReq();

      expect(res.status).toBe(status.notFound);
    });

    it("should update customer in db with new values and return it in response", async () => {
      const customer = await new CustomerModel({
        username,
        name,
        phone,
      }).save();
      id = customer._id.toHexString();
      name = "XYZ XYZ";

      const res = await execReq();

      const customerInDb = await CustomerModel.findById(id);
      expect(customerInDb).toHaveProperty("name", name);

      expect(res.body.name).toBe(name);
    });
  });

  describe("DELETE Suite /:id", () => {
    let token: string;
    let id: string;

    const execReq = () => {
      return request(app)
        .delete("/api/customers/" + id)
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

    it("should return error 404 when customer for given ID not found", async () => {
      const res = await execReq();
      expect(res.status).toBe(status.notFound);
    });

    it("should delete the customer from db and return deleted customer obj in response", async () => {
      const customer = await new CustomerModel({
        username: "abc123",
        name: "ABC ABC",
        phone: "1234567890",
      }).save();
      id = customer._id.toHexString();

      const res = await execReq();

      const checkCustomerinDB = await CustomerModel.findById(id);
      expect(checkCustomerinDB).toBeNull();

      expect(res.body).toHaveProperty("name", customer.name);
    });
  });
});
