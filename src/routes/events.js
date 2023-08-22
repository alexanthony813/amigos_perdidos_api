import {
  StatusEvent,
  Quiltro,
  User,
  statusEventStatuses,
} from "../models/index.js";
import express from "express";
import { twilioClient, twilioPhoneNumber } from "../index.js";

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
        .status(400)
        .send("quiltroId in body needs to match same in route");
    }
    if (statusEventStatuses.indexOf(newStatusEventJson.status) === -1) {
      return res.status(400).send("need to use a valid status");
    }
    const quiltro = await Quiltro.findOne({ quiltroId });
    if (!quiltro) {
      return res.status(404).send("quiltro not found");
    }
    const now = new Date();
    newStatusEventJson.time = now;
    const newStatusEvent = new StatusEvent(newStatusEventJson);
    await newStatusEvent.save();
    if (newStatusEvent.status === "problem_reported") {
      quiltro.lastReportedProblem = newStatusEvent;
    }
    quiltro.lastUpdatedAt = now;
    await quiltro.save();
    const body = `Se informó un problema con ${quiltro.name}! \n Foto aquí: ${newStatusEvent.photoUrl} \n Mensaje del denunciante:${newStatusEvent.details.body}`;
    const { uid } = quiltro;
    const user = await User.findOne({ uid });
    const { phoneNumber } = user;

    if (newStatusEvent.status === "problem_reported") {
      twilioClient.messages
        .create({
          body,
          from: `whatsapp:${twilioPhoneNumber}`,
          to: `whatsapp:${phoneNumber}`,
        })
        .then((value) => {
          return res.status(201).json(newStatusEvent);
        })
        .catch((error) => {
          console.error(error);
          return res.status(500).json(error);
        });
    } else {
      return res.status(201).json(newStatusEvent);
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

export default eventsRouter;
