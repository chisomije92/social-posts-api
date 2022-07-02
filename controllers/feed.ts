import { Request, Response, NextFunction } from "express";

export const getPosts = (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    posts: [
      {
        title: "My first post",
        content: "This is my first post",
      },
    ],
  });
};

export const createPost = (req: Request, res: Response, next: NextFunction) => {
  const { title, content } = req.body;
  res.status(201).json({
    message: "Post created successfully",
    post: {
      id: new Date().toISOString(),
      title,
      content,
    },
  });
};
