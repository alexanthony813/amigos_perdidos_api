import {
  Amigo,
  StatusEvent,
  PERMITTED_AMIGO_STATUSES,
  PERMITTED_STATUS_EVENT_STATUSES,
} from "../models/index.js";
import express from "express";

const eventsRouter = express.Router();

eventsRouter.get("/events", async (req, res) => {
  try {
    const statusEvents = await StatusEvent.find();
    return res.json(statusEvents.reverse());
  } catch (err) {
    return next(err);
  }
});

eventsRouter.get("/amigos/:amigoId/events", async (req, res) => {
  try {
    const { amigoId } = req.params;
    const statusEvents = await StatusEvent.find({ amigoId });
    return res.json(statusEvents.reverse());
  } catch (err) {
    return next(err);
  }
});

eventsRouter.post("/amigos/:amigoId/event", async (req, res, next) => {
  try {
    const { amigoId } = req.params;
    const newStatusEventJson = await req.body;
    if (!newStatusEventJson.amigoId) {
      newStatusEventJson.amigoId = amigoId;
    }
    if (
      !newStatusEventJson.status ||
      PERMITTED_STATUS_EVENT_STATUSES.indexOf(newStatusEventJson.status) === -1
    ) {
      return next(new Error(`Need to include valid even† status`));
    }
    if (newStatusEventJson.amigoId !== amigoId) {
      return res
        .status(404)
        .send("amigoId in body needs to match same in route");
    }
    const amigo = await Amigo.findOne({ _id: amigoId });
    if (!amigo) {
      return res.status(404).send("amigo not found");
    }
    const now = new Date();
    newStatusEventJson.time = now; // TODO figure out how to remove this for new records
    const newStatusEvent = new StatusEvent(newStatusEventJson);
    newStatusEvent.details = JSON.parse(newStatusEventJson.details);
    await newStatusEvent.save();
    amigo.lastStatusEvent = newStatusEvent;
    amigo.lastUpdatedAt = now;
    if (PERMITTED_AMIGO_STATUSES.indexOf(newStatusEvent.status) > -1) {
      amigo.status = newStatusEvent.status;
    }
    await amigo.save();
    return res.status(201).json(newStatusEvent);
  } catch (err) {
    return next(err);
  }
});

export default eventsRouter;
