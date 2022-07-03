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
    return res.status(422).json({
      message: "Validation failed, entered data is incorrect",
      errors: errors.array(),
    });
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
      console.log(err);
    });
};
