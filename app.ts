import express from "express";
import feedRoutes from "./routes/feed.js";

const app = express();

app.use("/feed", feedRoutes);

app.listen(8080);
