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
import { graphqlHTTP } from "express-graphql";
import { schema } from "./graphql/schema";
import resolvers from "./graphql/resolvers";
import { GraphQLError, GraphQLFormattedError } from "graphql";
import { graphQlErr } from "./utils/graphql-custom";

dotenv.config();
let conn_string: string;
if (process.env.MONGO_CONN_STRING) {
  conn_string = process.env.MONGO_CONN_STRING;
} else {
  throw new Error("MONGO_CONN_STRING is not set");
}

const app = express();
// const httpServer = createServer(app);
// const io = init(httpServer);
// io.on("connection", (socket: Socket) => {
//   console.log("New client connected");
// });

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

// app.use("/feed", feedRoutes);
// app.use("/auth", authRoutes);
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: resolvers,
    graphiql: true,
    // formatError: (err: GraphQLError) => {
    //   if (err.originalError) {
    //     return {
    //       message: err.originalError.message || err.message,
    //       // @ts-ignore
    //       status: err.originalError.status || 500,
    //     };
    //   }
    // },
    customFormatErrorFn: (err: GraphQLError) => {
      //   return {
      //     path: err.path,
      //     message: err.message,
      //     locations: err.locations,
      //     originalError: err.originalError,
      //   };
      if (!err.originalError) {
        console.log(err);
        return err;
      }
      console.log(err.originalError);
      const message = err.originalError.message;
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
    app.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });
