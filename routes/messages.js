import bcrypt from "bcrypt";
import https from "https";
import express from "express";
import fetch from "node-fetch";
import { Expo } from "expo-server-sdk";

// Create a new Expo SDK client
// optionally providing an access token if you have enabled push security
let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
const messagesRouter = express.Router();

// this has taken way too long already...and I want this to work for iOS without surprises
// "Note that FCM is not currently available for Expo iOS apps." -> https://docs.expo.dev/push-notifications/using-fcm/
// TODO before merge break up into other files
messagesRouter.get("/users/:userId/messages", async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender_id: userId }, { receiver_id: userId }],
    });

    return res.json(messages.reverse());
  } catch (err) {
    return res.status(500).send(new Error(err));
  }
});

messagesRouter.get("/messages", async (req, res) => {
  try {
    // const newMessageJson = await req.body;
    // send message to expo
    const expoMessage = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{
        to: "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
        title: "hello",
        body: "world",
      }]),
    });
    // const { species } = newMessageJson;
    // const newMessage = new Message(newMessageJson);
    // await newMessage.save();
    const response = await expoMessage.json()
    return res.json(response);
  } catch (err) {
    return res.status(500).send(new Error(err));
  }
});

export default messagesRouter;
