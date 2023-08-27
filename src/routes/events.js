import {
  StatusEvent,
  Quiltro,
  User,
  statusEventStatuses,
} from "../models/index.js";
import express from "express";
import { twilioClient, twilioPhoneNumber } from "../index.js";
import {
  subscribeUserToQuiltro,
  recordUserAdoptionInquiry,
} from "../utils/index.js";

const eventsRouter = express.Router();

eventsRouter.post("/twilio-webhook", async (req, res, next) => {
  try {
    const now = new Date();
    const newStatusEvent = new StatusEvent(newStatusEventJson);
    newStatusEvent.details = {
      body: "Logged event from twilio webhook",
    };
    newStatusEvent.time = now;
    await newStatusEvent.save();
    res.status(201).json({ newStatusEvent });
  } catch (error) {
    return next(error);
  }
});

eventsRouter.get("/events", async (req, res, next) => {
  try {
    const statusEvents = await StatusEvent.find();
    return res.json(statusEvents.reverse());
  } catch (error) {
    return next(error);
  }
});

eventsRouter.get("/quiltros/:quiltroId/events", async (req, res, next) => {
  try {
    const { quiltroId } = req.params;
    const statusEvents = await StatusEvent.find({ quiltroId });
    return res.json(statusEvents.reverse());
  } catch (error) {
    return next(error);
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

    const { uid } = quiltro;
    const adminUser = await User.findOne({ uid });
    const { phoneNumber } = adminUser;
    if (newStatusEvent.status === "adoption_inquiry") {
      const reportingUid = newStatusEvent.details.from;
      const reportingUser = await User.findOne({ uid: reportingUid });
      await subscribeUserToQuiltro(reportingUser, quiltroId);
      await recordUserAdoptionInquiry(reportingUser, quiltroId);
    }

    if (
      newStatusEvent.status === "problem_reported" ||
      newStatusEvent.status === "adoption_inquiry"
    ) {
      const body =
        newStatusEvent.status === "problem_reported"
          ? `Se informó un problema con ${quiltro.name}! \n Foto aquí: ${newStatusEvent.photoUrl} \n Mensaje del denunciante: ${newStatusEvent.details.body}`
          : newStatusEvent.details.body;
      twilioClient.messages
        .create({
          body,
          from: `${twilioPhoneNumber}`,
          to: `${phoneNumber}`,
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
  } catch (error) {
    return next(error);
  }
});

export default eventsRouter;
