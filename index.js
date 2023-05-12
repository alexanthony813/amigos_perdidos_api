import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import amigosRouter from "./routes/amigos.js";
import s3Router from "./routes/s3.js";
import mongoose from "mongoose";

const PORT = 3000;

export let dbClient;

const connectDb = async () => {
  try {
    // TODO update to use local mongo when wait script fixed
    // "mongodb://localhost:27017";
    const mongoUrl = process.env.MONGO_DB_URL; // easier for dev purposes for now, was working before docker
    dbClient = await mongoose.connect(mongoUrl, { dbName: "amigos" });
    console.log("DATABASE CONNECTED, APP STARTING");
    return dbClient;
  } catch (error) {
    console.log(error);
  }
};

await connectDb();

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("client"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/healthcheck", (req, res) => {
  return res.status(200).send();
});

app.get("/", (req, res) => {
  return res.status(200).send();
});

app.use("/", amigosRouter);
app.use("/s3", s3Router);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
