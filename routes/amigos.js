import express from "express";
import { dbClient } from "../index";

const amigosRoute = express.Router();

class Amigo {
  constructor({
    id = null,
    species,
    last_seen_address,
    name,
    description,
    message,
    photo_url,
    // owner_id,
    owner_number,
    stray,
    outdoor_amigo,
  }) {
    this.id = id;
    if (species === "perro") {
      // TODO better strategy here
      species = "dog";
    } else if (species === "gato") {
      species = "cat";
    }
    this.species = species;
    this.last_seen_address = last_seen_address;
    this.name = name;
    this.description = description;
    this.message = message;
    this.photo_url = photo_url;
    // this.owner_id = owner_id;
    this.owner_number = owner_number;
    this.stray = false; // TODO
    this.outdoor_amigo = false; // TODO!
  }
}


///////// TODO remove below when migration done

amigosRoute.get("/db", async (req, res) => {
  try {
    return await dbClient.collection('amigos').createMany(inMemoryAmigos)
  } catch (err) {
    res.json(err).status(400).send();
  }
});

/////////

amigosRoute.get(`/`, (req, res) => {
  if (inMemoryAmigos) {
    res.json(inMemoryAmigos).send();
  } else {
    res.status(404).send();
  }
});

amigosRoute.post("/", async (req, res) => {
  try {
    const newAmigoJson = await req.body;
    const newAmigo = new Amigo(newAmigoJson);
    const ids = Object.keys(inMemoryAmigos);
    const lastId = ids.sort()[ids.length - 1];
    const id = (Number(lastId) + 1).toString();
    newAmigo.id = id;
    inMemoryAmigos[id] = newAmigo;
    res.json(newAmigo).status(200).send();
  } catch (err) {
    res.json(err).status(400).send();
  }
});

export default amigosRoute;