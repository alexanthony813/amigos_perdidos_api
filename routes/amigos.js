import express from "express";
import { dbClient } from "../index.js";
import { Amigo } from "../models/index.js";

const amigosRoute = express.Router();

amigosRoute.get("/amigos", async (req, res) => {
  try {
    const amigos = await Amigo.find();
    res.json(amigos.reverse());
  } catch (err) {
    return res.status(500).json(err);
  }
});

amigosRoute.get("/amigos/:amigoId", async (req, res) => {
  const { amigoId } = req.params;
  if (!amigoId) {
    return res.status(400).send();
  }
  try {
    const amigo = await Amigo.findOne({ _id: amigoId });
    if (!amigo) {
      return res.status(404).send();
    } else {
      return res.json(amigo);
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

amigosRoute.get("/users/:userId/amigos", async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).send();
  }
  try {
    const amigo = await Amigo.find({ owner_id: userId });
    if (!amigo) {
      return res.status(404).send();
    } else {
      return res.json(amigo);
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

amigosRoute.post("/amigos", async (req, res) => {
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
