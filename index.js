import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import amigosPerdidosRouter from "./routes/amigos.js";
import s3Router from "./routes/s3.js";
import pg from "pg";

const PORT = 3000;
const HOST_NAME = "localhost";

export const dbClient = new pg.Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

const connectDb = async () => {
  try {
    await dbClient.connect();
    const res = await dbClient.query("SELECT * FROM version");
    console.log(res);
    await dbClient.end();
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

app.use("/amigos", amigosPerdidosRouter);
app.use("/s3", s3Router);

app.listen(PORT, HOST_NAME, () => {
  console.log(`Server running at ${HOST_NAME}:${PORT}`);
});
