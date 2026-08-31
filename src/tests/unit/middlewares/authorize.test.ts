import mongoose from "mongoose";
import { UserModel } from "../../../util/schemaModels.js";
import authorize from "../../../middlewares/authorize.js";
import { Request, Response } from "express";
import { jest } from "@jest/globals";

describe("Authorize Middleware Suite", () => {
  it("should populate req.user with the payload of valid jwt token", () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      isAdmin: false,
    };
    const token = (new UserModel(payload) as any).generateAuthToken();

    const req: Partial<Request> = {
      header: jest.fn().mockReturnValue(token),
    } as any;
    const res = {};
    const next = jest.fn();

    authorize(req as Request, res as Response, next);

    expect((req as any).user).toMatchObject(payload);
  });
});
