"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = void 0;
const user_1 = __importDefault(require("../models/user"));
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let secret;
if (process.env.JWT_SECRET) {
    secret = process.env.JWT_SECRET;
}
else {
    throw new Error("JWT_SECRET is not set");
}
const signup = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed, entered data is incorrect");
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const { name, email, password } = req.body;
    bcryptjs_1.default
        .hash(password, 12)
        .then((hashedPassword) => {
        const user = new user_1.default({
            name: name,
            email: email,
            password: hashedPassword,
        });
        user.save().then((result) => {
            res.status(201).json({
                message: "User created successfully",
                userId: result._id,
            });
        });
    })
        .catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};
exports.signup = signup;
const login = (req, res, next) => {
    const { email, password } = req.body;
    let loadedUser;
    user_1.default.findOne({ email: email })
        .then((user) => {
        if (!user) {
            const error = new Error("Could not find user.");
            //@ts-ignore
            error.statusCode = 404;
            throw error;
        }
        loadedUser = user;
        bcryptjs_1.default.compare(password, user.password).then((isEqual) => {
            if (!isEqual) {
                const error = new Error("Wrong password!");
                //@ts-ignore
                error.statusCode = 401;
                throw error;
            }
            const token = jsonwebtoken_1.default.sign({
                email: loadedUser.email,
                id: loadedUser._id.toString(),
            }, secret, {
                expiresIn: "1h",
            });
            res.status(200).json({
                message: "Successfully logged in!",
                token,
                userId: loadedUser._id.toString(),
            });
        });
    })
        .catch((err) => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};
exports.login = login;
//# sourceMappingURL=auth.js.map