import express from "express";
import feedRoutes from "./routes/feed";
import authRoutes from "./routes/auth";
import { Request, Response, NextFunction } from "express";
// import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { CustomError } from "./utils/custom-error";
import { Server } from "socket.io";
import { createServer } from "http";

dotenv.config();
let conn_string: string;
if (process.env.MONGO_CONN_STRING) {
  conn_string = process.env.MONGO_CONN_STRING;
} else {
  throw new Error("MONGO_CONN_STRING is not set");
}

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + "-" + file.originalname);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(express.json());

app.use("/images", express.static(path.join(__dirname, "../", "images")));

app.use(
  multer({
    storage: fileStorage,
    fileFilter: fileFilter,
  }).single("image")
);
app.use("/images", express.static("images"));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.use(
  (error: CustomError, req: Request, res: Response, next: NextFunction) => {
    console.log(error);
    const err = new CustomError(
      error.message,
      error.statusCode || 500,
      error.data
    );
    res.status(err.statusCode).json({ message: err.message, data: err.data });
  }
);

mongoose
  .connect(process.env.MONGO_CONN_STRING)
  .then(() => {
    // const io = new Server(app);
    // app.listen(8080);
    const httpServer = createServer(app);
    const io = new Server(httpServer);
    httpServer.listen(8080);
    io.on("connection", (socket) => {
        console.log("New client connected");
    }
  })
  .catch((err) => {
    console.log(err);
  });
