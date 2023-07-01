import express from "express";
import { Amigo } from "../models/index.js";

const amigosRouter = express.Router();

amigosRouter.get("/amigos", async (req, res) => {
  try {
    const amigos = await Amigo.find();
    return res.json(amigos.reverse());
  } catch (err) {
    return res.status(500).send(new Error(err));
  }
});

amigosRouter.get("/amigos/:amigo_id", async (req, res) => {
  const { amigo_id } = req.params;
  if (!amigo_id) {
    return res.status(400).send();
  }
  try {
    const amigo = await Amigo.findOne({ _id: amigo_id });
    if (!amigo) {
      return res.status(404).send();
    } else {
      return res.json(amigo);
    }
  } catch (err) {
    return res.status(500).send(new Error(err));
  }
});

// blame mongodb atlas auth :'(
// amigosRouter.get("/migrate", async (req, res) => {
//   try {
//     const amigos = await Amigo.find();
//     // const statusEvents = []
//     amigos.forEach((amigo) => {
//       const newStatusEvent = new StatusEvent({
//         time: new Date(),
//         amigo_id: amigo._id,
//         status: 'lost',
//         location: null
//       })
//       amigo.updateOne({ lastStatusEvent: JSON.stringify(newStatusEvent) })
//       await newStatusEvent.save()
//     })
//     if (updateResult.error) {
//       return res.status(500).send(updateResult.error);
//     } else {
//       return res.status(200).send();
//     }
//   } catch (err) {
//     return res.status(500).send(new Error(err));
//   }
// });

amigosRouter.get("/users/:userId/amigos", async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).send();
  }
  try {
    const amigo = await Amigo.find({ owner_id: userId });
    if (!amigo) {
      return res.status(404).seend();
    } else {
      return res.json(amigo);
    }
  } catch (err) {
    return res.status(500).send(new Error(err));
  }
});

amigosRouter.post("/amigos", async (req, res) => {
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
    await newAmigo.save();
    return res.status(201).json(newAmigo);
  } catch (err) {
    return res.status(500).send(new Error(err));
  }
});

export default amigosRouter;
