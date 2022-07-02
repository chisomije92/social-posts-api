"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const feed_js_1 = __importDefault(require("./routes/feed.js"));
const app = (0, express_1.default)();
app.use("/feed", feed_js_1.default);
app.listen(8080);
//# sourceMappingURL=app.js.map