"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const custom_error_1 = require("../utils/custom-error");
const socket_1 = require("../socket");
const getPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let queryPage;
    if (req.query && req.query.page) {
        queryPage = +req.query.page;
    }
    const currentPage = queryPage || 1;
    const perPage = 2;
    //   let totalItems: number;
    try {
        const totalItems = yield post_1.default.find().countDocuments();
        const posts = yield post_1.default.find()
            .populate("creator")
            .skip((currentPage - 1) * perPage)
            .limit(perPage);
        res.status(200).json({
            message: "Posts fetched successfully!",
            posts: posts,
            totalItems: totalItems,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getPosts = getPosts;
const createPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const error = new custom_error_1.CustomError("Validation failed, entered data is incorrect", 422, errors.array());
        if (req.file) {
            clearImage(req.file.path);
        }
        throw error;
    }
    if (!req.file) {
        const error = new custom_error_1.CustomError("No image provided", 422);
        throw error;
    }
    const { title, content } = req.body;
    const imageUrl = req.file.path.replace("\\", "/");
    try {
        const post = new post_1.default({
            title: title,
            content: content,
            imageUrl: imageUrl,
            creator: req.userId,
        });
        yield post.save();
        const user = yield user_1.default.findById(req.userId);
        user === null || user === void 0 ? void 0 : user.posts.push(post);
        yield (user === null || user === void 0 ? void 0 : user.save());
        const userSocket = (0, socket_1.getIO)().emit("posts", {
            action: "create",
            post: Object.assign(Object.assign({}, post.toObject()), { creator: {
                    _id: req.userId,
                    name: user === null || user === void 0 ? void 0 : user.name,
                } }),
        });
        res.status(201).json({
            message: "Post created successfully",
            post: post,
            creator: {
                _id: user === null || user === void 0 ? void 0 : user._id,
                name: user === null || user === void 0 ? void 0 : user.name,
            },
        });
    }
    catch (err) {
        next(err);
    }
});
exports.createPost = createPost;
const getPost = (req, res, next) => {
    const postId = req.params.postId;
    post_1.default.findById(postId)
        .then((post) => {
        if (!post) {
            const error = new custom_error_1.CustomError("Could not find post.", 404);
            throw error;
        }
        res.status(200).json({ message: "post fetched", post: post });
    })
        .catch((err) => {
        next(err);
    });
};
exports.getPost = getPost;
const updatePost = (req, res, next) => {
    const postId = req.params.postId;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const error = new custom_error_1.CustomError("Validation failed, entered data is incorrect", 422);
        throw error;
    }
    const { title, content } = req.body;
    let imageUrl = req.body.image;
    if (req.file) {
        imageUrl = req.file.path.replace("\\", "/");
    }
    if (!imageUrl) {
        const error = new custom_error_1.CustomError("No image provided", 422);
        throw error;
    }
    post_1.default.findById(postId)
        .populate("creator")
        .then((post) => {
        var _a;
        if (!post) {
            const error = new custom_error_1.CustomError("Could not find post.", 404);
            throw error;
        }
        const postObject = post.toObject();
        if (postObject.creator._id.toString() !== ((_a = req.userId) === null || _a === void 0 ? void 0 : _a.toString())) {
            const error = new custom_error_1.CustomError("Not authorized", 403);
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
        (0, socket_1.getIO)().emit("posts", {
            action: "update",
            post: Object.assign({}, result.toObject()),
        });
        res.status(200).json({
            message: "Post updated successfully",
            post: result,
        });
    })
        .catch((err) => {
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
            const error = new custom_error_1.CustomError("Could not find post.", 404);
            throw error;
        }
        if (post.creator.toString() !== ((_a = req.userId) === null || _a === void 0 ? void 0 : _a.toString())) {
            const error = new custom_error_1.CustomError("Not authorized", 403);
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
            const error = new custom_error_1.CustomError("Could not find user.", 404);
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
        next(err);
    });
};
exports.deletePost = deletePost;
const clearImage = (imagePath) => {
    imagePath = path_1.default.join(__dirname, "../../", imagePath);
    fs_1.default.unlink(imagePath, (err) => console.log(err));
};
//# sourceMappingURL=feed.js.map