import config from "config";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { status } from "../util/constants.js";

export default (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("x-auth-token");
  if (!token)
    return res
      .status(status.unauthorised)
      .send("Access Denied. No Token provided!");

  try {
    const decoded = jwt.verify(
      token,
      config.get("jwtPrivateKey"),
    ) as jwt.JwtPayload;

    // Ideally jwt will auto handle token expiration logic
    // But if someone tries to send a token without "exp" then force logout them
    if (decoded.iat) {
      const originalIssuedTimeMs = decoded.iat * 1000;
      const currentTimeMs = Date.now();
      const elapsedMs = currentTimeMs - originalIssuedTimeMs;

      const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

      // Force logout if the token was issued more than 15 minutes ago
      if (elapsedMs > FIFTEEN_MINUTES_MS) {
        return res
          .status(status.unauthorised)
          .send("User not logged in or session expired!");
      }
    }

    (req as any).user = {
      _id: (decoded as jwt.JwtPayload)._id,
      isAdmin: (decoded as jwt.JwtPayload).isAdmin,
    };
    next();
  } catch (err) {
    console.log(err);
    if ((err as any).name === "TokenExpiredError")
      res
        .status(status.unauthorised)
        .send("User not logged in or session expired!");
    else res.status(status.unauthorised).send(err);
  }
};
