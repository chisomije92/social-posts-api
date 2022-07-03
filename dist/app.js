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
dotenv_1.default.config();
let conn_string;
if (process.env.MONGO_CONN_STRING) {
    conn_string = process.env.MONGO_CONN_STRING;
}
else {
    throw new Error("MONGO_CONN_STRING is not set");
}
const app = (0, express_1.default)();
// app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});
app.use(express_1.default.json());
app.use("/feed", feed_1.default);
mongoose_1.default
    .connect(process.env.MONGO_CONN_STRING)
    .then(() => {
    app.listen(8080);
})
    .catch((err) => {
    console.log(err);
});
//# sourceMappingURL=app.js.map