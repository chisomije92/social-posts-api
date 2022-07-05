import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import Post, { PostType } from "../models/post";
import User, { UserType } from "../models/user";
import fs from "fs";
import path from "path";
import { Types } from "mongoose";
import { CustomError } from "../utils/custom-error";
import { getIO } from "../socket";

export const getPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let queryPage;
  if (req.query && req.query.page) {
    queryPage = +req.query.page;
  }
  const currentPage: number = queryPage || 1;
  const perPage = 2;
  //   let totalItems: number;
  try {
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate("creator")
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      message: "Posts fetched successfully!",
      posts: posts,
      totalItems: totalItems,
    });
  } catch (err) {
    next(err);
  }
};

export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new CustomError(
      "Validation failed, entered data is incorrect",
      422,
      errors.array()
    );
    if (req.file) {
      clearImage(req.file.path);
    }
    throw error;
  }

  if (!req.file) {
    const error = new CustomError("No image provided", 422);
    throw error;
  }
  const { title, content } = req.body;
  const imageUrl = req.file.path.replace("\\", "/");
  try {
    const post = new Post({
      title: title,
      content: content,
      imageUrl: imageUrl,
      creator: req.userId,
    });
    await post.save();
    const user = await User.findById(req.userId);
    user?.posts.push(post);
    await user?.save();
    const userSocket = getIO().emit("posts", {
      action: "create",
      post: {
        ...post.toObject(),
        creator: {
          _id: req.userId,
          name: user?.name,
        },
      },
    });

    res.status(201).json({
      message: "Post created successfully",
      post: post,
      creator: {
        _id: user?._id,
        name: user?.name,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getPost = (req: Request, res: Response, next: NextFunction) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new CustomError("Could not find post.", 404);
        throw error;
      }
      res.status(200).json({ message: "post fetched", post: post });
    })
    .catch((err: CustomError) => {
      next(err);
    });
};

export const updatePost = (req: Request, res: Response, next: NextFunction) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new CustomError(
      "Validation failed, entered data is incorrect",
      422
    );

    throw error;
  }
  const { title, content } = req.body;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  }
  if (!imageUrl) {
    const error = new CustomError("No image provided", 422);
    throw error;
  }
  Post.findById(postId)
    .populate("creator")
    .then((post) => {
      if (!post) {
        const error = new CustomError("Could not find post.", 404);
        throw error;
      }
      const postObject = post.toObject();
      if (postObject.creator._id.toString() !== req.userId?.toString()) {
        const error = new CustomError("Not authorized", 403);
        throw error;
      }

      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then((result) => {
      getIO().emit("posts", {
        action: "update",
        post: {
          ...result.toObject(),
        },
      });
      res.status(200).json({
        message: "Post updated successfully",
        post: result,
      });
    })
    .catch((err: CustomError) => {
      next(err);
    });
};

export const deletePost = (req: Request, res: Response, next: NextFunction) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new CustomError("Could not find post.", 404);
        throw error;
      }
      if (post.creator.toString() !== req.userId?.toString()) {
        const error = new CustomError("Not authorized", 403);
        throw error;
      }
      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      if (!user) {
        const error = new CustomError("Could not find user.", 404);
        throw error;
      }
      const userData = user.posts as Types.DocumentArray<PostType>;
      userData.pull(postId);
      return user.save();
    })
    .then((result) => {
      res.status(200).json({
        message: "Post deleted successfully",
      });
    })
    .catch((err: CustomError) => {
      next(err);
    });
};

const clearImage = (imagePath: string) => {
  imagePath = path.join(__dirname, "../../", imagePath);
  fs.unlink(imagePath, (err) => console.log(err));
};
