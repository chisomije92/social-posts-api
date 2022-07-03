"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const feed_1 = __importDefault(require("./routes/feed"));
// import bodyParser from "body-parser";
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
let conn_string;
if (process.env.MONGO_CONN_STRING) {
    conn_string = process.env.MONGO_CONN_STRING;
}
else {
    throw new Error("MONGO_CONN_STRING is not set");
}
const app = (0, express_1.default)();
// const __dirname = path.resolve();
// console.log(__dirname);
// app.use(bodyParser.json());
app.use(express_1.default.json());
app.use("/images", express_1.default.static(path_1.default.join(__dirname, "images")));
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});
app.use("/feed", feed_1.default);
app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    res.status(status).json({ message: message });
});
mongoose_1.default
    .connect(process.env.MONGO_CONN_STRING)
    .then(() => {
    app.listen(8080);
})
    .catch((err) => {
    console.log(err);
});
//# sourceMappingURL=app.js.map