import express from "express";
import { dbClient } from "../index.js";

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

const inMemoryAmigos = {
  1: {
    id: 1,
    species: "dog",
    last_seen_address: "Ñuñoa, y visto en Grecia/Quilin",
    name: "Chester",
    description: "Mestizo, con collar",
    message: "2,000,000 de recompensa!",
    photo_url: `https://amigosperdidos.s3.sa-east-1.amazonaws.com/chester_perro_2.jpg`,
    owner_id: 1,
    owner_number: "+56965832621",
    stray: false,
    outdoor_amigo: false,
    // details: { TODO
    //   additional_photos: [],
    // },
  },
  2: {
    id: 2,
    species: "dog",
    last_seen_address: "Av. Las Condes con Padre Hurta",
    name: "Kali",
    description: "Chihuahua adoptada, esterilizada y con chip",
    message: "Instagram @buscamosakali",
    photo_url:
      "https://amigosperdidos.s3.sa-east-1.amazonaws.com/kali_perro.jpg",
    owner_id: 2,
    owner_number: "+56961912271",
    stray: false,
    outdoor_amigo: false,
  },
  3: {
    id: 3,
    species: "dog",
    last_seen_address: "Ñuñoa",
    name: "Maximo",
    description: "Perro mediano color dorado y blanco raza mix",
    message: "Se ofrece recompensa",
    photo_url:
      "https://amigosperdidos.s3.sa-east-1.amazonaws.com/maximo_perro.jpg",
    owner_id: 3,
    owner_number: "+56972739243",
    stray: false,
    outdoor_amigo: false,
  },
  4: {
    id: 4,
    species: "parrot",
    last_seen_address: "Plaza Egaña",
    name: "Pingüin",
    description:
      "Cata, color celeste con marca en su nariz, puntos en el cuello",
    message: "Recompensa! Ayuda para encontrar a nuestra catita australiana",
    photo_url:
      "https://amigosperdidos.s3.sa-east-1.amazonaws.com/pinguin_ave.jpg",
    owner_id: 4,
    owner_number: "+56986967889",
    stray: false,
    outdoor_amigo: false,
  },
  5: {
    id: 5,
    species: "cat",
    last_seen_address: "Carrera Pinto #1942",
    name: "Nombre no es disponible",
    description: "No tiene collar pero si tiene vacunas, es timida y cariñosa",
    message:
      "Necesitamos encontrarla, por favor cualquier noticia que vuela a casa",
    photo_url:
      "https://amigosperdidos.s3.sa-east-1.amazonaws.com/gato_anonimo_1.jpg",
    owner_id: 5,
    owner_number: "+56930945963",
    stray: false,
    outdoor_amigo: false,
  },
  6: {
    id: 6,
    species: "cat",
    last_seen_address: "Ñuñoa",
    name: "Nombre no es disponible",
    description: "Gatita perdida!",
    message: "Gracias!!",
    photo_url:
      "https://amigosperdidos.s3.sa-east-1.amazonaws.com/gato_anonimo_2.jpg",
    owner_id: 6,
    owner_number: "+56965178500",
    stray: false,
    outdoor_amigo: false,
  },
  7: {
    id: 7,
    species: "parrot",
    last_seen_address: "Plaza Egaña",
    name: "Pingüin",
    description:
      "Cata, color celeste con marca en su nariz, puntos en el cuello",
    message: "Recompensa! Ayuda para encontrar a nuestra catita australiana",
    photo_url:
      "https://amigosperdidos.s3.sa-east-1.amazonaws.com/pinguin_ave.jpg",
    owner_id: 7,
    owner_number: "+56986967889",
    stray: false,
    outdoor_amigo: false,
  },
};

amigosRoute.get(`/`, (req, res) => {
  console.dir(dbClient);
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