"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const feed_1 = require("../controllers/feed");
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
router.get("/posts", feed_1.getPosts);
router.post("/posts", [
    (0, express_validator_1.body)("title").trim().isLength({ min: 5 }),
    (0, express_validator_1.body)("content").trim().isLength({ min: 5 }),
], feed_1.createPost);
exports.default = router;
//# sourceMappingURL=feed.js.map