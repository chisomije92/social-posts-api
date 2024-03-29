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
const user_1 = __importDefault(require("../models/user"));
const post_1 = __importDefault(require("../models/post"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const validator_1 = __importDefault(require("validator"));
const graphql_custom_1 = require("../utils/graphql-custom");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const file_1 = require("../utils/file");
dotenv_1.default.config();
let secret;
if (process.env.JWT_SECRET) {
    secret = process.env.JWT_SECRET;
}
else {
    throw new Error("JWT_SECRET is not set");
}
const resolvers = {
    createUser: ({ userInput }, req) => __awaiter(void 0, void 0, void 0, function* () {
        const { name, email, password } = userInput;
        const errors = [];
        if (!validator_1.default.isEmail(email)) {
            errors.push({ message: "Email is invalid" });
        }
        if (validator_1.default.isEmpty(password) ||
            !validator_1.default.isLength(password, { min: 5 })) {
            errors.push({ message: "Password is too short" });
        }
        if (errors.length > 0) {
            const error = new graphql_custom_1.CustomGraphQlError("Validation failed, entered data is incorrect", 500, errors);
            throw error;
        }
        const existingUser = yield user_1.default.findOne({ email: email });
        if (existingUser) {
            throw new Error("User already exists");
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 12);
        const user = new user_1.default({
            email: email,
            password: hashedPassword,
            name: name,
        });
        const createdUser = yield user.save();
        return Object.assign(Object.assign({}, createdUser.toObject()), { _id: createdUser._id.toString() });
    }),
    login: ({ email, password }, req) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield user_1.default.findOne({ email: email });
        if (!user) {
            throw new graphql_custom_1.CustomGraphQlError("User does not exist", 404);
        }
        const isEqual = yield bcryptjs_1.default.compare(password, user.password);
        if (!isEqual) {
            throw new Error("Password is incorrect");
        }
        const token = jsonwebtoken_1.default.sign({
            userId: user._id.toString(),
            email: user.email,
        }, secret, { expiresIn: "1h" });
        return {
            token: token,
            userId: user._id.toString(),
        };
    }),
    createPost: ({ postInput }, req) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.isAuth) {
            throw new graphql_custom_1.CustomGraphQlError("Not authenticated", 401);
        }
        const { title, content, imageUrl } = postInput;
        const errors = [];
        if (validator_1.default.isEmpty(title) || !validator_1.default.isLength(title, { min: 5 })) {
            errors.push({ message: "Title is required" });
        }
        if (validator_1.default.isEmpty(content)) {
            errors.push({ message: "Content is required" });
        }
        if (errors.length > 0) {
            const error = new graphql_custom_1.CustomGraphQlError("Validation failed, entered data is incorrect", 500, errors);
            throw error;
        }
        const user = yield user_1.default.findById(req.userId);
        if (!user) {
            throw new graphql_custom_1.CustomGraphQlError("User does not exist", 404);
        }
        const post = new post_1.default({
            title: title,
            content: content,
            imageUrl: imageUrl,
            creator: user,
        });
        const createdPost = yield post.save();
        user.posts.push(createdPost);
        yield user.save();
        return Object.assign(Object.assign({}, createdPost.toObject()), { _id: createdPost._id.toString(), createdAt: createdPost.createdAt.toISOString(), updatedAt: createdPost.updatedAt.toISOString() });
    }),
    posts: ({ page }, req) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.isAuth) {
            throw new graphql_custom_1.CustomGraphQlError("Not authenticated", 401);
        }
        if (!page) {
            page = 1;
        }
        const perPage = 2;
        const totalPosts = yield post_1.default.find().countDocuments();
        const posts = yield post_1.default.find()
            .populate("creator")
            .sort({ createdAt: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage);
        return {
            posts: posts.map((post) => {
                return Object.assign(Object.assign({}, post.toObject()), { _id: post._id.toString(), createdAt: post.createdAt.toISOString(), updatedAt: post.updatedAt.toISOString() });
            }),
            totalPosts: totalPosts,
        };
    }),
    post: ({ postId }, req) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.isAuth) {
            throw new graphql_custom_1.CustomGraphQlError("Not authenticated", 401);
        }
        const post = yield post_1.default.findById(postId).populate("creator");
        if (!post) {
            throw new graphql_custom_1.CustomGraphQlError("Post does not exist", 404);
        }
        return Object.assign(Object.assign({}, post.toObject()), { _id: post._id.toString(), createdAt: post.createdAt.toISOString(), updatedAt: post.updatedAt.toISOString() });
    }),
    updatePost: ({ postId, postInput }, req) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (!req.isAuth) {
            throw new graphql_custom_1.CustomGraphQlError("Not authenticated", 401);
        }
        const post = yield post_1.default.findById(postId).populate("creator");
        if (!post) {
            throw new graphql_custom_1.CustomGraphQlError("Post does not exist", 404);
        }
        //
        if (post.creator._id.toString() !== ((_a = req.userId) === null || _a === void 0 ? void 0 : _a.toString())) {
            throw new graphql_custom_1.CustomGraphQlError("Not authorized", 403);
        }
        const { title, content, imageUrl } = postInput;
        const errors = [];
        if (validator_1.default.isEmpty(title) || !validator_1.default.isLength(title, { min: 5 })) {
            errors.push({ message: "Title is required" });
        }
        if (validator_1.default.isEmpty(content)) {
            errors.push({ message: "Content is required" });
        }
        if (errors.length > 0) {
            const error = new graphql_custom_1.CustomGraphQlError("Validation failed, entered data is incorrect", 500, errors);
            throw error;
        }
        post.title = title;
        post.content = content;
        if (imageUrl !== "undefined") {
            post.imageUrl = imageUrl;
        }
        const updatedPost = yield post.save();
        return Object.assign(Object.assign({}, updatedPost.toObject()), { _id: updatedPost._id.toString(), createdAt: updatedPost.createdAt.toISOString(), updatedAt: updatedPost.updatedAt.toISOString() });
    }),
    deletePost: ({ postId }, req) => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        if (!req.isAuth) {
            throw new graphql_custom_1.CustomGraphQlError("Not authenticated", 401);
        }
        const post = yield post_1.default.findById(postId);
        if (!post) {
            throw new graphql_custom_1.CustomGraphQlError("Post does not exist", 404);
        }
        if (post.creator.toString() !== ((_b = req.userId) === null || _b === void 0 ? void 0 : _b.toString())) {
            throw new graphql_custom_1.CustomGraphQlError("Not authorized", 403);
        }
        (0, file_1.clearImage)(post.imageUrl, true);
        yield post.remove();
        const user = yield user_1.default.findById(req.userId);
        user === null || user === void 0 ? void 0 : user.posts.pull(postId);
        yield (user === null || user === void 0 ? void 0 : user.save());
        return true;
    }),
};
exports.default = resolvers;
//# sourceMappingURL=resolvers.js.map