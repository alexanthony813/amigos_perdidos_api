import express, { query } from "express";
import joi from "joi";
import jwt from "jsonwebtoken";
import { dbClient } from "../index.js";
import { Amigo, User } from "../models/index.js";
import validateWith from "../middleware/validation.js";

const amigosRoute = express.Router();

amigosRoute.get("/amigos", async (req, res) => {
  try {
    const amigos = await Amigo.find();
    res.json(amigos.reverse());
  } catch (err) {
    return res.status(500).json(err);
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
const user_schema = joi.object({
  username: joi.string().required().min(5),
  phone_number: joi.string().required().min(5),
});

amigosRoute.post("/users", validateWith(user_schema), async (req, res) => {
  try {
    const { username, phone_number } = req.body;
    const match = await User.find({ phone_number: phone_number });
    if (match.length) {
      return res
        .status(400)
        .send({
          error: `A user with the given phone number ${phone_number} already exists.`,
        });
    }

    const user = new User({ username, phone_number });
    user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

amigosRoute.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    return res.send(usersStore.getUsers());
  }
});

amigosRoute.post("/auth", validateWith(user_schema), async (req, res) => {
  const { username, phone_number } = req.body;
  const query_result = await User.find({ phone_number, username });
  const user = query_result[0];
  if (!user || user.phone_number !== phone_number) {
    return res.status(400).send({ error: "Invalid username or phone_number." });
  }

  const token = jwt.sign(
    { userId: user.id, name: user.name, username },
    "jwtPrivateKey" // TODO update and remove
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
