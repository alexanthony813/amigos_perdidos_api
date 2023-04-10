import express from "express";
import { dbClient } from "../index.js";
import { Amigo } from "../models/index.js";

const amigosRoute = express.Router();

amigosRoute.get("/", async (req, res) => {
  try {
    const amigos = await Amigo.find();
    res.json(amigos);
  } catch (err) {
    return res.status(500).json(err);
  }
});

amigosRoute.post("/", async (req, res) => {
  try {
    const newAmigoJson = await req.body;
    const { species } = newAmigoJson;
    // TODO better strategy here, remove conditional
    if (species === "perro") {
      species = "dog";
    } else if (species === "gato") {
      species = "cat";
    }
    const newAmigo = new Amigo(newAmigoJson);
    newAmigo.save();
    res.status(200).json(newAmigo);
  } catch (err) {
    res.status(200).json(err);
  }
});

export default amigosRoute;
