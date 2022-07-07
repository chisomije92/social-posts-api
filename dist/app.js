"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import bodyParser from "body-parser";
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const custom_error_1 = require("./utils/custom-error");
const express_graphql_1 = require("express-graphql");
const schema_1 = require("./graphql/schema");
const resolvers_1 = __importDefault(require("./graphql/resolvers"));
const is_auth_1 = __importDefault(require("./middleware/is-auth"));
const fs_1 = __importDefault(require("fs"));
// console.log(path.join(__dirname, "../", "images"));
dotenv_1.default.config();
let conn_string;
if (process.env.MONGO_CONN_STRING) {
    conn_string = process.env.MONGO_CONN_STRING;
}
else {
    throw new Error("MONGO_CONN_STRING is not set");
}
const app = (0, express_1.default)();
const fileStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images");
    },
    filename: (req, file, cb) => {
        cb(null, (0, uuid_1.v4)() + "-" + file.originalname);
    },
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg") {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
};
app.use(express_1.default.json());
app.use("/images", express_1.default.static(path_1.default.join(__dirname, "../", "images")));
app.use((0, multer_1.default)({
    storage: fileStorage,
    fileFilter: fileFilter,
}).single("image"));
// app.use("/images", express.static("images"));
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});
app.use(is_auth_1.default);
app.put("/post-image", (req, res, next) => {
    if (!req.isAuth) {
        throw new custom_error_1.CustomError("Not authenticated", 401);
    }
    if (!req.file) {
        return res.status(200).json({ message: "No file provided!" });
    }
    if (req.body.oldPath) {
        clearImage(req.body.oldPath);
    }
    return res.status(200).json({
        message: "File stored!",
        filePath: req.file.path.replace("\\", "/"),
    });
});
// app.use("/feed", feedRoutes);
// app.use("/auth", authRoutes);
app.use("/graphql", (0, express_graphql_1.graphqlHTTP)({
    schema: schema_1.schema,
    rootValue: resolvers_1.default,
    graphiql: true,
    customFormatErrorFn: (err) => {
        if (!err.originalError) {
            console.log(err);
            return err;
        }
        console.log(err.originalError);
        const message = err.message;
        const status = 500;
        const locations = err.locations;
        const path = err.path;
        return {
            message,
            status,
            locations,
            path,
        };
    },
}));
app.use((error, req, res, next) => {
    console.log(error);
    const err = new custom_error_1.CustomError(error.message, error.statusCode || 500, error.data);
    res.status(err.statusCode).json({ message: err.message, data: err.data });
});
mongoose_1.default
    .connect(process.env.MONGO_CONN_STRING)
    .then(() => {
    app.listen(8080);
})
    .catch((err) => {
    console.log(err);
});
const clearImage = (imagePath) => {
    imagePath = path_1.default.join(__dirname, "../", imagePath);
    fs_1.default.unlink(imagePath, (err) => console.log(err));
};
//# sourceMappingURL=app.js.map