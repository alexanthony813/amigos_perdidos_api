import { StatusEvent, Quiltro } from "../models/index.js";
import express from "express";
import twilio from "twilio";
const accountSid = "ACdfa7e2c0e0981f148a474e182201cbe1";
const authToken = "";
const client = twilio(accountSid, authToken);


const eventsRouter = express.Router();

eventsRouter.get("/events", async (req, res) => {
  try {
    const statusEvents = await StatusEvent.find();
    return res.json(statusEvents.reverse());
  } catch (err) {
    return res.status(500).json(err);
  }
});

eventsRouter.get("/quiltros/:quiltroId/events", async (req, res) => {
  try {
    const { quiltroId } = req.params;
    const statusEvents = await StatusEvent.find({ quiltroId });
    return res.json(statusEvents.reverse());
  } catch (err) {
    return res.status(500).json(err);
  }
});

eventsRouter.post("/quiltros/:quiltroId/event", async (req, res) => {
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
    if (!quiltro) {
      return res.status(404).send("quiltro not found");
    }
    const now = new Date();
    newStatusEventJson.time = now; // TODO figure out how to remove this for new records
    const newStatusEvent = new StatusEvent(newStatusEventJson);
    await newStatusEvent.save();
    quiltro.lastStatusEvent = newStatusEvent;
    quiltro.lastUpdatedAt = now;
    await quiltro.save();
    client.messages.create({
      body: `Se informó un problema sobre ${quiltro.name}, foto aqui ${newStatusEvent}`,
      from: "whatsapp:+14155238886",
      to: "whatsapp:+17868349832",
    });
    return res.status(201).json(newStatusEvent);
  } catch (err) {
    return res.status(500).json(err);
  }
});

export default eventsRouter;
