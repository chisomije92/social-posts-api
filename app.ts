import express from "express";
import feedRoutes from "./routes/feed";
// import bodyParser from "body-parser";

const app = express();

// app.use(bodyParser.json());

app.use(express.json());

app.use("/feed", feedRoutes);

app.listen(8080);
