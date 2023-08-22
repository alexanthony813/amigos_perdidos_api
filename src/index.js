import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import quiltrosRouter from "./routes/quiltros.js";
import eventsRouter from "./routes/events.js";
import s3Router from "./routes/s3.js";
import functions from "firebase-functions";
import dotenv from "dotenv";
import mongoose from "mongoose";
import twilio from "twilio";

const PORT = 3000;

dotenv.config();

export let dbClient;
export let twilioClient;
export let twilioPhoneNUmber;

const connectDb = async () => {
  try {
    const mongoUrl = process.env.MONGO_DB_URL;
    dbClient = await mongoose.connect(mongoUrl, { dbName: "quiltros" });
    console.log("DATABASE CONNECTED, APP STARTING");
  } catch (error) {
    console.error(error);
  }
};

const connectTwilio = async () => {
  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    twilioPhoneNUmber = process.env.TWILIO_PHONE_NUMBER;
    console.log("TWILIO CONNECTED");
  } catch (error) {
    console.error(error);
  }
};

connectDb();
connectTwilio();

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

app.use("/", quiltrosRouter);
app.use("/", eventsRouter);

app.use("/s3", s3Router);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

export const api = functions.region("southamerica-east1").https.onRequest(app);
