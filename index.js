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
    dbClient = await mongoose.connect(process.env.MONGO_DB_URL);
    return dbClient;
  } catch (error) {
    console.log(error);
  }
};

connectDb();

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

app.use("/amigos", amigosRouter);
app.use("/s3", s3Router);

// app.listen(())

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
