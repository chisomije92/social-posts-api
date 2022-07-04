import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import Post, { PostType } from "../models/post";
import User, { UserType } from "../models/user";
import fs from "fs";
import path from "path";
import { Types } from "mongoose";
import { CustomError } from "../utils/custom-error";

export const getPosts = (req: Request, res: Response, next: NextFunction) => {
  let queryPage;
  if (req.query && req.query.page) {
    queryPage = +req.query.page;
  }
  const currentPage: number = queryPage || 1;
  const perPage = 2;
  let totalItems: number;
  Post.find()
    .countDocuments()
    .then((num) => {
      totalItems = num;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => {
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: posts,
        totalItems: totalItems,
      });
    })
    .catch((err: CustomError) => {
      next(err);
    });
};

export const createPost = (req: Request, res: Response, next: NextFunction) => {
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
  let creator: UserType | null;
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });
  post
    .save()
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      creator = user;
      user?.posts.push(post);
      return user?.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully",
        post: post,
        creator: {
          _id: creator?._id,
          name: creator?.name,
        },
      });
    })
    .catch((err: CustomError) => {
      next(err);
    });
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
    const error = new Error("Validation failed, entered data is incorrect");
    // @ts-ignore
    error.statusCode = 422;
    throw error;
  }
  const { title, content } = req.body;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  }
  if (!imageUrl) {
    const error = new Error("No image provided");
    // @ts-ignore
    error.statusCode = 422;
    throw error;
  }
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
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save();
    })
    .then((result) => {
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
