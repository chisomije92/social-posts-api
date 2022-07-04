"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = void 0;
const express_validator_1 = require("express-validator");
const signup = (req, res, next) => {
    const { name, email, password } = req.body;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation failed, entered data is incorrect");
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
};
exports.signup = signup;
//# sourceMappingURL=auth.js.map