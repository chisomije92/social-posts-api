"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPost = exports.createPost = exports.getPosts = void 0;
const express_validator_1 = require("express-validator");
const post_1 = __importDefault(require("../models/post"));
const getPosts = (req, res, next) => {
    post_1.default.find()
        .then((posts) => {
        res.status(200).json({
            message: "Posts fetched successfully",
            posts: posts,
        });
    })
        .catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};
exports.getPosts = getPosts;
const createPost = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed, entered data is incorrect");
        // @ts-ignore
        error.statusCode = 422;
        throw error;
    }
    if (!req.file) {
        const error = new Error("No image provided");
        // @ts-ignore
        error.statusCode = 422;
        throw error;
    }
    const { title, content } = req.body;
    const imageUrl = req.file.path.replace("\\", "/");
    const post = new post_1.default({
        title: title,
        content: content,
        imageUrl: imageUrl,
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
exports.createPost = createPost;
const getPost = (req, res, next) => {
    const postId = req.params.postId;
    post_1.default.findById(postId)
        .then((post) => {
        if (!post) {
            const error = new Error("Could not find post.");
            //@ts-ignore
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ message: "post fetched", post: post });
    })
        .catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};
exports.getPost = getPost;
//# sourceMappingURL=feed.js.map