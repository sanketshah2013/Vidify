import mongoose from "mongoose";
import { UserModel } from "../../../util/schemaModels.js";
import jwt from "jsonwebtoken";
import config from "config";

describe("userSchema Test Suit", () => {
  it("should return valid jwt token", () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      isAdmin: false,
    };
    const user = new UserModel(payload);
    const token = (user as any).generateAuthToken();
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    expect(decoded).toMatchObject(payload);
  });
});
