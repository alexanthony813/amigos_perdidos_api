import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import quiltrosRouter from "./routes/quiltros.js";
import eventsRouter from "./routes/events.js";
import s3Router from "./routes/s3.js";
import functions from "firebase-functions";

const PORT = 3000;

export let dbClient;

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

export const api = functions.region('southamerica-east1').https.onRequest(app);
