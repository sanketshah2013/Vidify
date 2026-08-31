import config from "config";
import jwt from "jsonwebtoken";
import request from "supertest";
import { status } from "../../../util/constants.js";
import { GenreModel, UserModel } from "../../../util/schemaModels.js";
import app from "../index.js";

describe("POST Suite: /", () => {
  afterEach(async () => {
    await GenreModel.deleteMany({});
  });

  let token: string;

  const execReq = () => {
    return request(app)
      .post("/api/genres/")
      .set("x-auth-token", token)
      .send({ name: "Genre1" });
  };

  beforeEach(() => {
    token = new (UserModel as any)().generateAuthToken();
  });

  it("should give 401 error when no auth token provided", async () => {
    token = "";
    const res = await execReq();
    expect(res.status).toBe(status.unauthorised);
    expect(res.text).toContain("No Token provided");
  });

  it("should give 401 error when invalid auth token provided", async () => {
    token = "A";
    const res = await execReq();
    expect(res.status).toBe(status.unauthorised);
  });

  it("should give 401 error when expired auth token provided", async () => {
    const payload = {
      exp: Math.floor(Date.now() / 1000) - 3600, // Current time in seconds minus 1 hour (3600 seconds)
    };

    token = jwt.sign(payload, config.get("jwtPrivateKey") as string);
    const res = await execReq();
    expect(res.status).toBe(status.unauthorised);
    expect(res.text).toContain("expired");
  });

  it("should validate expiration manually and give 401 error when valid but old auth token provided", async () => {
    const payload = {
      iat: Math.floor(Date.now() / 1000) - 24 * 60 * 60, // Issued 24 hours ago
    };

    token = jwt.sign(payload, config.get("jwtPrivateKey") as string);
    const res = await execReq();
    expect(res.status).toBe(status.unauthorised);
    expect(res.text).toContain("expired");
  });

  it("should validate logic for expiration and give 401 error when empty iat token provided", async () => {
    token = jwt.sign({}, config.get("jwtPrivateKey") as string, {
      noTimestamp: true,
    });
    const res = await execReq();
    expect(res.status).toBe(status.unauthorised);
    expect(res.text).toContain("Invalid Token");
  });

  it("should give status 200 when valid auth token provided", async () => {
    const res = await execReq();
    expect(res.status).toBe(status.ok);
  });
});
