import express from "express";
import fetch from "node-fetch";
import { Message } from "../models/index.js";
import crypto from "crypto";

const algorithm = "aes-256-cbc";

const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);

const encryptText = (text) => {
  let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString("hex");
};

const decryptText = (text) => {
  let encryptedText = Buffer.from(text, "hex");
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

// Create a new Expo SDK client
// optionally providing an access token if you have enabled push security
const messagesRouter = express.Router();

// this has taken way too long already...and I want this to work for iOS without surprises
// "Note that FCM is not currently available for Expo iOS apps." -> https://docs.expo.dev/push-notifications/using-fcm/
// TODO before merge break up into other files
messagesRouter.get("/users/:userId/messages", async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ from: userId }, { recepient: userId }],
    }).map((result) => {
      result.body = decryptText(result.body);
      return result;
    });

    return res.json(messages.reverse());
  } catch (err) {
    return res.status(500).send(new Error(err));
  }
});

messagesRouter.post("/messages", async (req, res) => {
  try {
    const { message } = req.body;
    const { expo_message } = message;

    const expoMessageRequest = await fetch(
      "https://exp.host/--/api/v2/push/send",
      {
        method: "POST",
        headers: {
          host: "exp.host",
          accept: "application/json",
          "accept-encoding": "gzip, deflate",
          "content-type": "application/json",
        },
        body: JSON.stringify([expo_message]), // TODO and below make array compatible before merge plzzzz
      }
    );
    const newMessage = new Message(message);
    const expoResponse = await expoMessageRequest.json();
    if (
      expoResponse.data &&
      expoResponse.data[0] &&
      expoResponse.data[0].status === "ok"
    ) {
      newMessage.expo_message_id = expoResponse.data.id;
      newMessage.amigo_id = newMessage.amigo_id;
      newMessage.body = encryptText(newMessage.body);
      await newMessage.save();
      return res.json({ expoResponse, message: newMessage });
    } else {
      return res.status(500).send(expoResponse);
    }
  } catch (err) {
    return res.status(500).send(new Error(err));
  }
});

export default messagesRouter;
