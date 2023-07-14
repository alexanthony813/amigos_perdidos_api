import express from "express";
import { userSchema, User, Amigo } from "../models/index.js";
// import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const amigosRouter = express.Router();
amigosRouter.post("/users", async (req, res) => {
  try {
    const { phoneNumber } = req.body; // password
    // const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ phoneNumber, joinedOn: new Date() }); // , password: hashedPassword
    await user.save();
    return res.status(201).json(user);
  } catch (err) {
    return next(err);
  }
});

amigosRouter.patch("/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { expoPushToken } = req.body;
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(400).send({ error: "Could not find user." });
    }
    if (!expoPushToken) {
      return next(new Error("need valid expoPushToken"));
    }
    user.expoPushToken = expoPushToken;
    await user.save();
    return next(user);
  } catch (err) {
    return next(err);
  }
});

amigosRouter.post("/auth", async (req, res) => {
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
  return res.send(token);
});

amigosRouter.get("/amigos", async (req, res, next) => {
  try {
    const amigos = await Amigo.find();
    return res.json(amigos.reverse());
  } catch (err) {
    next(err);
  }
});

amigosRouter.get("/amigos/:amigo_id", async (req, res, next) => {
  const { amigo_id } = req.params;
  if (!amigo_id) {
    return res.status(400).send();
  }
  try {
    const amigo = await Amigo.findOne({ _id: amigo_id });
    if (!amigo) {
      return res.status(404).send();
    } else {
      return res.json(amigo);
    }
  } catch (err) {
    return next(err);
  }
});

amigosRouter.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    return res.json(users);
  } catch (err) {
    return next(err);
  }
});

amigosRouter.get("/users/:userId/amigos", async (req, res, next) => {
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
    return next(err);
  }
});

amigosRouter.post("/amigos", async (req, res) => {
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
    await newAmigo.save();
    return res.status(201).json(newAmigo);
  } catch (err) {
    return next(err);
  }
});

export default amigosRouter;
