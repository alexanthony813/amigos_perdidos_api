import express from "express";
import { Quiltro, User, Amigo } from "../models/index.js";
// import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const amigosRouter = express.Router();
amigosRouter.post("/users", async (req, res, next) => {
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

amigosRouter.patch("/users/:userId", async (req, res, next) => {
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

amigosRouter.post("/auth", async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return next(new Error("Could not find the phone number."));
    }
    // const passwordMatch = await bcrypt.compare(password, user.password);
    // if (!passwordMatch) {
    //   return res.status(400).send({ error: "Invalid username or password." });
    // }

    const token = jwt.sign(
      { userId: user._id, phoneNumber },
      process.env.JWT_PRIVATE_KEY
    );
    return res.status(201).json(token);
  } catch (err) {
    return next(err);
  }
});

amigosRouter.get("/amigos", async (req, res, next) => {
  try {
    const amigos = await Amigo.find();
    return res.json(amigos.reverse());
  } catch (err) {
    next(err);
  }
});

amigosRouter.get("/amigos/:amigoId", async (req, res, next) => {
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
    const amigo = await Amigo.find({ ownerId: userId });
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
    newAmigo.lastSeenDate = new Date();
    await newAmigo.save();
    return res.status(201).json(newAmigo);
  } catch (err) {
    return next(err);
  }
});


amigosRouter.post("/quiltros", async (req, res) => {
  try {
    const newQuiltroJson = await req.body;
    const newQuiltro = new Quiltro(newQuiltroJson);
    await newQuiltro.save();
    return res.status(201).json(newQuiltro);
  } catch (err) {
    return next(err);
  }
});

amigosRouter.get("/users/:userId/quiltros", async (req, res, next) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).send();
  }
  try {
    const quiltro = await Quiltro.find({ userId: userId });
    if (!quiltro) {
      return res.status(404).send();
    } else {
      return res.json(quiltro);
    }
  } catch (err) {
    return next(err);
  }
});

export default amigosRouter;
