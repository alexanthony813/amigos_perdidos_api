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
    return res.status(500).send(new Error(err));
  }
});

eventsRouter.get("/amigos/:amigo_id/events", async (req, res) => {
  try {
    const { amigo_id } = req.params;
    const statusEvents = await StatusEvent.find({ amigo_id });
    return res.json(statusEvents.reverse());
  } catch (err) {
    return res.status(500).send(new Error(err));
  }
});

eventsRouter.post("/amigos/:amigo_id/event", async (req, res) => {
  try {
    const { amigo_id } = req.params;
    const newStatusEventJson = await req.body;
    if (!newStatusEventJson.amigo_id) {
      newStatusEventJson.amigo_id = amigo_id;
    }
    if (
      !newStatusEventJson.status ||
      PERMITTED_STATUS_EVENT_STATUSES.indexOf(newStatusEventJson.status) === -1
    ) {
      return res
        .status(400)
        .send(
          new Error(
            `Need to include status in ${PERMITTED_STATUS_EVENT_STATUSES}`
          )
        );
    }
    if (newStatusEventJson.amigo_id !== amigo_id) {
      return res
        .status(404)
        .send("amigo_id in body needs to match same in route");
    }
    const amigo = await Amigo.findOne({ _id: amigo_id });
    if (!amigo) {
      return res.status(404).send("amigo not found");
    }
    const now = new Date();
    newStatusEventJson.time = now; // TODO figure out how to remove this for new records
    const newStatusEvent = new StatusEvent(newStatusEventJson);
    newStatusEvent.details = newStatusEventJson.details;
    await newStatusEvent.save();
    amigo.last_status_event = newStatusEvent;
    amigo.last_updated_at = now;
    if (PERMITTED_AMIGO_STATUSES.indexOf(newStatusEvent.status) > -1) {
      amigo.status = newStatusEvent.status;
    }
    await amigo.save();
    return res.status(201).json(newStatusEvent);
  } catch (err) {
    return res.status(500).send(new Error(err));
  }
});

// eventsRouter.post("/amigos/:amigo_id/events", async (req, res) => {
//   try {
//     const { amigo_id } = req.params;
//     const newStatusEventsJson = await req.body;
//     const newStatusEvents = [];
//     await newStatusEventsJson.forEach(async (newStatusEventJson) => {
//       if (!newStatusEventJson.amigo_id) {
//         newStatusEventJson.amigo_id = amigo_id;
//       }
//       if (newStatusEventJson.amigo_id !== amigo_id) {
//         return res
//           .status(404)
//           .send("amigo_id in body needs to match same in route");
//       }
//       newStatusEventJson.time = new Date();
//       const newStatusEvent = new StatusEvent(newStatusEventJson);
//       newStatusEvents.push(newStatusEvent);
//       await newStatusEvent.save();
//     });
//     return res.status(201).json(newStatusEvents);
//   } catch (err) {
//     return res.status(500).send(new Error(err));
//   }
// });

export default eventsRouter;
