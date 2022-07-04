import mongoose, { Types } from "mongoose";
import { PostType } from "./post";

const { Schema, model } = mongoose;

export interface UserType {
  _id?: Types.ObjectId;
  email: string;
  password: string;
  status: string;
  name: string;
  posts: PostType[];
}

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "I am new!",
  },
  name: {
    type: String,
    required: true,
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
});

export default model<UserType>("User", UserSchema);
