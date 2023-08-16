import { StatusEvent, Quiltro, User } from "../models/index.js";
import express from "express";
const eventsRouter = express.Router();
import { Vonage } from "@vonage/server-sdk";

const vonage = new Vonage({
  apiKey: "c44738e8",
  apiSecret: "4PX728waT2b4bYLt"
});

// crear vs criar no creear 
// para no por - para los aportes
// perfil nuevo
// para numeros chilenos
// agregar no ariesgar
// primer! tercer tambien por posicion. creo que primero sustantivo, primer es adjetivo?
// confirmar no conformar

// incentivar 
// suposiciones
// requerir
// cemientos - base - (no fundacion!)
// puntual tiene otro significado tambien!

async function sendSMS(to, text) {
  const from = "13252490380"
  await vonage.sms
    .send({ to, from, text })
    .then((resp) => {
      console.log("Message sent successfully");
      console.log(resp);
    })
    .catch((err) => {
      console.log("There was an error sending the messages.");
      console.error(err);
    });
}

eventsRouter.get("/testsms", async (req, res, next) => {
  try {
    const test = await sendSMS("17868349832", 'if this works..')
    return res.json(test);
  } catch (err) {
    return next(err);
  }
});

eventsRouter.get("/events", async (req, res) => {
  try {
    const statusEvents = await StatusEvent.find();
    return res.json(statusEvents.reverse());
  } catch (err) {
    return next(err);
  }
});

eventsRouter.get("/quiltros/:quiltroId/events", async (req, res) => {
  try {
    const { quiltroId } = req.params;
    const statusEvents = await StatusEvent.find({ quiltroId });
    return res.json(statusEvents.reverse());
  } catch (err) {
    return next(err);
  }
});

eventsRouter.post("/quiltros/:quiltroId/event", async (req, res, next) => {
  try {
    const { quiltroId } = req.params;
    const newStatusEventJson = await req.body;
    if (!newStatusEventJson.quiltroId) {
      newStatusEventJson.quiltroId = quiltroId;
    }
    if (newStatusEventJson.quiltroId !== quiltroId) {
      return res
        .status(404)
        .send("quiltroId in body needs to match same in route");
    }
    const quiltro = await Quiltro.findOne({ quiltroId });
    const { uid, name } = quiltro;
    if (!quiltro) {
      return res.status(404).send("quiltro not found");
    }
    const now = new Date();
    newStatusEventJson.time = now; // TODO figure out how to remove this for new records
    const newStatusEvent = new StatusEvent(newStatusEventJson);
    await newStatusEvent.save();
    quiltro.lastStatusEvent = newStatusEvent;
    quiltro.lastUpdatedAt = now;
    const admin = await User.findOne({ uid });
    const { phoneNumber } = admin;
    // vonage doesn't like the +, firebaseRequires it ¯\_(ツ)_/¯
    const formattedPhoneNumber = phoneNumber.slice(1)
    const text = `Se informo un problema con ${name}, foto aqui ${newStatusEvent.photo_url}`
    await sendSMS(phoneNumber, text)
    await quiltro.save();
    return res.status(201).json(newStatusEvent);
  } catch (err) {
    return next(err);
  }
});

export default eventsRouter;
