"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.updatePost = exports.getPost = exports.createPost = exports.getPosts = void 0;
const express_validator_1 = require("express-validator");
const post_1 = __importDefault(require("../models/post"));
const user_1 = __importDefault(require("../models/user"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const getPosts = (req, res, next) => {
    let queryPage;
    if (req.query && req.query.page) {
        queryPage = +req.query.page;
    }
    const currentPage = queryPage || 1;
    const perPage = 2;
    let totalItems;
    post_1.default.find()
        .countDocuments()
        .then((num) => {
        totalItems = num;
        return post_1.default.find()
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
    let creator;
    const post = new post_1.default({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId,
    });
    post
        .save()
        .then((result) => {
        return user_1.default.findById(req.userId);
    })
        .then((user) => {
        creator = user;
        user === null || user === void 0 ? void 0 : user.posts.push(post);
        return user === null || user === void 0 ? void 0 : user.save();
    })
        .then((result) => {
        res.status(201).json({
            message: "Post created successfully",
            post: post,
            creator: {
                _id: creator._id,
                name: creator.name,
            },
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
const updatePost = (req, res, next) => {
    const postId = req.params.postId;
    const errors = (0, express_validator_1.validationResult)(req);
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
    post_1.default.findById(postId)
        .then((post) => {
        var _a;
        if (!post) {
            const error = new Error("Could not find post.");
            //@ts-ignore
            error.statusCode = 404;
            throw error;
        }
        if (post.creator.toString() !== ((_a = req.userId) === null || _a === void 0 ? void 0 : _a.toString())) {
            const error = new Error("Not authorized");
            //@ts-ignore
            error.statusCode = 403;
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
        .catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};
exports.updatePost = updatePost;
const deletePost = (req, res, next) => {
    const postId = req.params.postId;
    post_1.default.findById(postId)
        .then((post) => {
        var _a;
        if (!post) {
            const error = new Error("Could not find post.");
            //@ts-ignore
            error.statusCode = 404;
            throw error;
        }
        if (post.creator.toString() !== ((_a = req.userId) === null || _a === void 0 ? void 0 : _a.toString())) {
            const error = new Error("Not authorized");
            //@ts-ignore
            error.statusCode = 403;
            throw error;
        }
        clearImage(post.imageUrl);
        return post_1.default.findByIdAndRemove(postId);
    })
        .then((result) => {
        return user_1.default.findById(req.userId);
    })
        .then((user) => {
        if (!user) {
            const error = new Error("Could not find user.");
            //@ts-ignore
            error.statusCode = 404;
            throw error;
        }
        const userData = user.posts;
        userData.pull(postId);
        return user.save();
    })
        .then((result) => {
        res.status(200).json({
            message: "Post deleted successfully",
        });
    })
        .catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};
exports.deletePost = deletePost;
const clearImage = (imagePath) => {
    imagePath = path_1.default.join(__dirname, "../../", imagePath);
    fs_1.default.unlink(imagePath, (err) => console.log(err));
};
//# sourceMappingURL=feed.js.map