import mongoose, { Types } from "mongoose";

const { Schema, model } = mongoose;

export interface PostType extends mongoose.Document {
  _id?: Types.ObjectId;
  imageUrl: string;
  title: string;
  content: string;
  creator: {
    _id: Types.ObjectId;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model<PostType>("Post", PostSchema);
