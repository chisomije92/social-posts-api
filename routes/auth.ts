import express from "express";
import { body } from "express-validator";
import { signup } from "../controllers/auth";
import User from "../models/user";

const router = express.Router();

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Email must be valid")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email already exists");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("password").trim().not().isEmpty(),
  ],
  signup
);

export default router;
