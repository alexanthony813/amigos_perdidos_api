const bodyParser = require("body-parser")
const amigosPerdidosRouter = require("./routes/amigos");

const PORT = 3000;
const HOST_NAME = "localhost";

const app = express();
app.use(express.static("client"));
app.use(bodyParser.urlencoded({extended: true}));

app.use("/amigos", weatherRouter);


app.listen(PORT, HOST_NAME, ()=> {
    console.log(`Server running at ${HOST_NAME}:${PORT}`)
})