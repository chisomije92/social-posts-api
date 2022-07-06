import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();
let secret: any;

if (process.env.JWT_SECRET) {
  secret = process.env.JWT_SECRET;
} else {
  throw new Error("JWT_SECRET is not set");
}

export default (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    req.isAuth = false;

    return next();
  }

  const token: string = authHeader.split(" ")[1];

  let decodedToken: any;
  try {
    decodedToken = jwt.verify(token, secret);
  } catch (err) {
    req.isAuth = false;

    return next();
  }

  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  req.userId = decodedToken.userId;
  req.isAuth = true;

  next();
};
