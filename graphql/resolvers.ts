import User from "../models/user";
import bcrypt from "bcryptjs";
import validator from "validator";
import { CustomError } from "../utils/custom-error";
import { graphQlErr } from "../utils/graphql-custom";
import { GraphQLError } from "graphql";

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
      const error = new graphQlErr(
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
    console.log(createdUser.toObject());
    return {
      ...createdUser.toObject(),
      password: null,
      _id: createdUser._id.toString(),
    };
  },
};

export default resolvers;
