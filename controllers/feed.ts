import { Request, Response, NextFunction } from "express";

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
  const { title, content } = req.body;
  res.status(201).json({
    message: "Post created successfully",
    post: {
      _id: new Date().toISOString(),
      title,
      content,
      creator: {
        name: "John Doe",
      },
      createdAt: new Date(),
    },
  });
};
