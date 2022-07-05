import User from "../models/user";
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { CustomError } from "../utils/custom-error";

dotenv.config();
let secret: string;

if (process.env.JWT_SECRET) {
  secret = process.env.JWT_SECRET;
} else {
  throw new Error("JWT_SECRET is not set");
}
export const signup = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error: CustomError = new CustomError(
      "Validation failed, entered data is incorrect",
      422,
      errors.array()
    );

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
    .catch((err: CustomError) => {
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
        const error = new CustomError("Could not find user.", 404);
        throw error;
      }
      loadedUser = user;

      bcrypt.compare(password, user.password).then((isEqual) => {
        if (!isEqual) {
          const error = new CustomError("Wrong password!", 401);
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
    .catch((err: CustomError) => {
      next(err);
    });
};
