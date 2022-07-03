import express from "express";
import feedRoutes from "./routes/feed";
// import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
let conn_string: string;
if (process.env.MONGO_CONN_STRING) {
  conn_string = process.env.MONGO_CONN_STRING;
} else {
  throw new Error("MONGO_CONN_STRING is not set");
}

const app = express();

// app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.use(express.json());

app.use("/feed", feedRoutes);

mongoose
  .connect(process.env.MONGO_CONN_STRING)
  .then(() => {
    app.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });
