import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import Post from "../models/post";

export const getPosts = (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    posts: [
      {
        _id: 1,
        title: "My first post",
        content: "This is my first post",
        imageUrl: "images/pizza.png",
        creator: {
          name: "John Doe",
        },
        createdAt: new Date(),
      },
    ],
  });
};

export const createPost = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect");
    // @ts-ignore
    error.statusCode = 422;
    throw error;
  }
  const { title, content } = req.body;
  const post = new Post({
    title: title,
    content: content,
    imageUrl: "images/pizza.png",
    creator: {
      name: "John Doe",
    },
  });
  post
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully",
        post: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
