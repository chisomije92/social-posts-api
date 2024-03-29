import express from "express";
import { Request, Response, NextFunction } from "express";

import mongoose from "mongoose";
import dotenv from "dotenv";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { CustomError } from "./utils/custom-error";
import { graphqlHTTP } from "express-graphql";
import { schema } from "./graphql/schema";
import resolvers from "./graphql/resolvers";
import { GraphQLError } from "graphql";
import isAuth from "./middleware/is-auth";

import { clearImage } from "./utils/file";

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

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(isAuth);
app.get('/"  (req, res, next) => {}
        res.send('ok'))
app.put("/post-image", (req, res, next) => {
  if (!req.isAuth) {
    throw new CustomError("Not authenticated", 401);
  }
  if (!req.file) {
    return res.status(200).json({ message: "No file provided!" });
  }
  if (req.body.oldPath) {
    clearImage(req.body.oldPath, false);
  }

  return res.status(200).json({
    message: "File stored!",
    filePath: req.file.path.replace("\\", "/"),
  });
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: resolvers,
    graphiql: true,
    customFormatErrorFn: (err: GraphQLError) => {
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
  })
);
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
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.log(err);
  });
