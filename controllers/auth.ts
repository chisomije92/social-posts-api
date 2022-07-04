import User from "../models/user";
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const signup = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error: any = new Error(
      "Validation failed, entered data is incorrect"
    );
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
};
