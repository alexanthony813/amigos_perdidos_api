const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors")
const amigosPerdidosRouter = require("./routes/amigos");
const s3Router = require("./routes/s3");

const PORT = 3000;
const HOST_NAME = "localhost";

const app = express();

app.use(cors())
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
