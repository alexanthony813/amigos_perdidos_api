import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import amigosRouter from "./routes/amigos.js";
import authRouter from "./routes/events.js";
import eventsRouter from "./routes/events.js";
import messagesRouter from "./routes/messages.js";
import s3Router from "./routes/s3.js";
import mongoose from "mongoose";

const PORT = 3000;

export let dbClient;

const connectDb = async () => {
  try {
    const mongoUrl = process.env.MONGO_DB_URL;
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
app.use("/", eventsRouter);
app.use("/", authRouter);
app.use("/", messagesRouter);

app.use("/s3", s3Router);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
