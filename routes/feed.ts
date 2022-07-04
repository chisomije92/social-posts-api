import express from "express";
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  updatePost,
} from "../controllers/feed";
import { body } from "express-validator";
import isAuth from "../middleware/is-auth";
const router = express.Router();

router.get("/posts", isAuth, getPosts);
router.post(
  "/posts",
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  createPost
);
router.get("/posts/:postId", isAuth, getPost);
router.put(
  "/posts/:postId",
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  updatePost
);

router.delete("/posts/:postId", isAuth, deletePost);
export default router;
