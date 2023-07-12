import express from "express";
import { Message } from "../models/index.js";
import ExpoClient from "../clients/expo.js";
// Create a new Expo SDK client
// optionally providing an access token if you have enabled push security
const messagesRouter = express.Router();
const expoClient = new ExpoClient();
// this has taken way too long already...and I want this to work for iOS without surprises
// "Note that FCM is not currently available for Expo iOS apps." -> https://docs.expo.dev/push-notifications/using-fcm/
// TODO before merge break up into other files
messagesRouter.get("/users/:userId/messages", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [{ from: userId }, { recepient: userId }],
    });

    return res.json(messages.reverse());
  } catch (err) {
    return next(err);
  }
});

messagesRouter.post("/messages", async (req, res, next) => {
  try {
    const { message } = req.body;
    const { expo_message } = message;
    const newMessage = new Message(message);
    const expoResponse = await sendExpoMessage(expo_message, true); // todo make dynamic based on env
    if (expoResponse?.data[0]?.status === "ok") {
      // is this right or expoResponse &&
      newMessage.expo_message_id = expoResponse.data.id;
      newMessage.amigo_id = newMessage.amigo_id;
      await newMessage.save();
      return res.json({ expoResponse, message: newMessage });
    } else {
      return next(expoResponse);
    }
  } catch (err) {
    return next(err);
  }
});

export default messagesRouter;
