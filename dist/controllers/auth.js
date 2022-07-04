"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = void 0;
const user_1 = __importDefault(require("../models/user"));
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
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
//# sourceMappingURL=auth.js.map