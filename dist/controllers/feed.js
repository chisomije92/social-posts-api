"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPost = exports.getPosts = void 0;
const express_validator_1 = require("express-validator");
const getPosts = (req, res, next) => {
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
exports.getPosts = getPosts;
const createPost = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: "Validation failed, entered data is incorrect",
            errors: errors.array(),
        });
    }
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
exports.createPost = createPost;
//# sourceMappingURL=feed.js.map