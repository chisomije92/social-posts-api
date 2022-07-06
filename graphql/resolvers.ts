import User from "../models/user";
import bcrypt from "bcryptjs";

const resolvers: any = {
  createUser: async ({ userInput }: any, req: any) => {
    const existingUser = await User.findOne({ email: userInput.email });
    if (existingUser) {
      throw new Error("User already exists");
    }
    const hashedPassword = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      password: hashedPassword,
      name: userInput.name,
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
