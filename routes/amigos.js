import bcrypt from "bcrypt";
import express, { query } from "express";
import Joi from "Joi";
import jwt from "jsonwebtoken";
import { Amigo, StatusEvent, User } from "../models/index.js";
import validateWith from "../middleware/validation.js";
import auth from "../middleware/auth.js";

const amigosRoute = express.Router();

amigosRoute.get("/amigos", async (req, res) => {
  try {
    const amigos = await Amigo.find();
    res.json(amigos.reverse());
  } catch (err) {
    return res.status(500).json(err);
  }
});

amigosRoute.get("/events", async (req, res) => {
  try {
    const statusEvents = await StatusEvent.find();
    res.json(statusEvents.reverse());
  } catch (err) {
    return res.status(500).json(err);
  }
});

amigosRoute.get("/amigos/:amigoId/events", async (req, res) => {
  
  try {
    const { amigoId } = req.params;
    const statusEvents = await StatusEvent.find({ amigoId });
    res.json(statusEvents.reverse());
  } catch (err) {
    return res.status(500).json(err);
  }
});

amigosRoute.post("/amigos/:amigoId/events", async (req, res) => {
  try {
    const { amigoId } = req.params;
    if (!newStatusEventJson.amigoId) {
      newStatusEventJson.amigoId = amigoId
    }
    if (newStatusEventJson.amigoId !== amigoId) {
      return res.status(404).send('amigoId in body needs to match same in route')
    }
    const newStatusEventJson = await req.body;
    const newStatusEvent = new StatusEvent(newStatusEventJson);
    newStatusEvent.save();
    res.status(201).json(newStatusEvent);
  } catch (err) {
    res.status(500).json(err);
  }
});

amigosRoute.get("/amigos/:amigoId", async (req, res) => {
  const { amigoId } = req.params;
  if (!amigoId) {
    return res.status(400).send();
  }
  try {
    const amigo = await Amigo.findOne({ _id: amigoId });
    if (!amigo) {
      return res.status(404).send();
    } else {
      return res.json(amigo);
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

// blame mongodb atlas auth being fucked
amigosRoute.get("/migrate", async (req, res) => {
  try {
    const amigos = await Amigo.find();
    // const statusEvents = []
    amigos.forEach((amigo) => {
      const newStatusEvent = new StatusEvent({
        time: Date.now(),
        amigoId: amigo._id,
        status: 'lost',
        location: null
      })
      amigo.updateOne({ lastStatusEvent: JSON.stringify(newStatusEvent) })
      newStatusEvent.save()
    })
    if (updateResult.error) {
      return res.status(500).send(updateResult.error);
    } else {
      return res.status(200).send();
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

amigosRoute.get("/users/:userId/amigos", async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).send();
  }
  try {
    const amigo = await Amigo.find({ owner_id: userId });
    if (!amigo) {
      return res.status(404).send();
    } else {
      return res.json(amigo);
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

amigosRoute.post("/amigos", async (req, res) => {
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
    newAmigo.save();
    res.status(201).json(newAmigo);
  } catch (err) {
    res.status(500).json(err);
  }
});

// TODO extend validation to other endpoints, TODO break into separate auth/user route
const user_schema = Joi.object({
  username: Joi.string().required().min(5),
  password: Joi.string().required().min(5),
});

amigosRoute.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    return res.send(usersStore.getUsers());
  }
});

amigosRoute.post("/users", validateWith(user_schema), async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

amigosRoute.post("/auth", validateWith(user_schema), async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).send({ error: "Could not find user." });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(400).send({ error: "Invalid username or password." });
  }

  const token = jwt.sign(
    { userId: user.id, username },
    process.env.JWT_PRIVATE_KEY
  );
  res.send(token);
});

amigosRoute.post(
  "/expoPushTokens",
  [auth, validateWith({ token: Joi.string().required() })],
  (req, res) => {
    const user = usersStore.getUserById(req.user.userId);
    if (!user) return res.status(400).send({ error: "Invalid user." });

    user.expoPushToken = req.body.token;
    console.log("User registered for notifications: ", user);
    res.status(201).send();
  }
);

export default amigosRoute;
