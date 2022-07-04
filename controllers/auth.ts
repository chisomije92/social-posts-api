import User from "../models/user";
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
let secret: any;

if (process.env.JWT_SECRET) {
  secret = process.env.JWT_SECRET;
} else {
  throw new Error("JWT_SECRET is not set");
}
export const signup = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error: any = new Error(
      "Validation failed, entered data is incorrect"
    );
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const { name, email, password } = req.body;
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        name: name,
        email: email,
        password: hashedPassword,
      });
      user.save().then((result) => {
        res.status(201).json({
          message: "User created successfully",
          userId: result._id,
        });
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  let loadedUser: any;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error("Could not find user.");
        //@ts-ignore
        error.statusCode = 404;
        throw error;
      }
      loadedUser = user;

      bcrypt.compare(password, user.password).then((isEqual) => {
        if (!isEqual) {
          const error = new Error("Wrong password!");
          //@ts-ignore
          error.statusCode = 401;
          throw error;
        }
        const token = jwt.sign(
          {
            email: loadedUser.email,
            id: loadedUser._id.toString(),
          },
          secret,
          {
            expiresIn: "1h",
          }
        );
        res.status(200).json({
          message: "Successfully logged in!",
          token,
          userId: loadedUser._id.toString(),
        });
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
