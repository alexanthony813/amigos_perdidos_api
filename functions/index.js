/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
import functions from "firebase-functions";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/test", (req, res) => {
  res.send("You did it! 🥳");
});

export const api = functions.https.onRequest(app);
