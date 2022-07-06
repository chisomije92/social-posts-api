"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
exports.default = (req, res, next) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        req.isAuth = false;
        return next();
    }
    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
        decodedToken = jsonwebtoken_1.default.verify(token, secret);
    }
    catch (err) {
        req.isAuth = false;
        return next();
    }
    if (!decodedToken) {
        req.isAuth = false;
        return next();
    }
    req.userId = decodedToken.userId;
    req.isAuth = true;
    next();
};
//# sourceMappingURL=is-auth.js.map