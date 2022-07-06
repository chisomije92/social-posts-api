import User from "../models/user";
import Post from "../models/post";
import bcrypt from "bcryptjs";
import validator from "validator";
import { CustomGraphQlError } from "../utils/graphql-custom";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
let secret: any;

if (process.env.JWT_SECRET) {
  secret = process.env.JWT_SECRET;
} else {
  throw new Error("JWT_SECRET is not set");
}

const resolvers: any = {
  createUser: async ({ userInput }: any, req: any) => {
    const { name, email, password } = userInput;
    const errors = [];
    if (!validator.isEmail(email)) {
      errors.push({ message: "Email is invalid" });
    }

    if (
      validator.isEmpty(password) ||
      !validator.isLength(password, { min: 5 })
    ) {
      errors.push({ message: "Password is too short" });
    }

    if (errors.length > 0) {
      const error = new CustomGraphQlError(
        "Validation failed, entered data is incorrect",
        500,
        errors
      );
      throw error;
    }

    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      throw new Error("User already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedPassword,
      name: name,
    });
    const createdUser = await user.save();

    return {
      ...createdUser.toObject(),
      password: null,
      _id: createdUser._id.toString(),
    };
  },

  login: async ({ email, password }: any, req: any) => {
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new CustomGraphQlError("User does not exist", 404);
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      throw new Error("Password is incorrect");
    }
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      secret,
      { expiresIn: "1h" }
    );
    return {
      token: token,
      userId: user._id.toString(),
    };
  },

  createPost: async ({ postInput }: any, req: any) => {
    const { title, content, imageUrl } = postInput;
    const errors = [];
    if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
      errors.push({ message: "Title is required" });
    }
    if (validator.isEmpty(content)) {
      errors.push({ message: "Content is required" });
    }
    // if (!validator.isURL(imageUrl)) {
    //   errors.push({ message: "Image url is invalid" });
    // }

    if (errors.length > 0) {
      const error = new CustomGraphQlError(
        "Validation failed, entered data is incorrect",
        500,
        errors
      );
      throw error;
    }

    const post = new Post({
      title: title,
      content: content,
      imageUrl: imageUrl,
    });
    const createdPost = await post.save();
    return {
      ...createdPost.toObject(),
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt,
      updatedAt: createdPost.updatedAt,
    };
  },
};

export default resolvers;
