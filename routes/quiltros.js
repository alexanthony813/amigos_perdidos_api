import express from "express";
import { Quiltro, User } from "../models/index.js";
// import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const quiltrosRouter = express.Router();
quiltrosRouter.post("/users", async (req, res, next) => {
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

quiltrosRouter.patch("/users/:userId", async (req, res, next) => {
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

// subscribe user
quiltrosRouter.patch(
  "/users/:userId/quiltros/:quiltroId",
  async (req, res, next) => {
    try {
      const { userId, quiltroId } = req.params;
      const user = await User.findOne({ userId });
      if (!user) {
        return res.status(400).send({ error: "Could not find user." });
      }
      user.quiltroIds = !user.quiltroIds
        ? [quiltroId]
        : user.quiltroIds.slice().concat([quiltroId]);
      await user.save();
      return next(user);
    } catch (err) {
      return next(err);
    }
  }
);

quiltrosRouter.post("/auth", async (req, res, next) => {
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

quiltrosRouter.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    return res.json(users);
  } catch (err) {
    return next(err);
  }
});

quiltrosRouter.post("/quiltros", async (req, res, next) => {
  try {
    const newQuiltroJson = await req.body;
    const { userId } = newQuiltroJson;
    const newQuiltro = new Quiltro(newQuiltroJson);
    await newQuiltro.save();
    const user = await User.findOne({ _id: userId });
    user.quiltroIds = !user.quiltroIds
      ? [newQuiltro._id]
      : user.quiltroIds.slice().concat([quiltroId]);
    await user.save();
    return res.status(201).json(newQuiltro);
  } catch (err) {
    return next(err);
  }
});

quiltrosRouter.get("/users/:userId/quiltros", async (req, res, next) => {
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

quiltrosRouter.get("/quiltros", async (req, res, next) => {
  try {
    const quiltros = await Quiltro.find();
    return res.json(quiltros.reverse());
  } catch (err) {
    next(err);
  }
});

quiltrosRouter.get("/quiltros/:quiltroId", async (req, res, next) => {
  const { quiltroId } = req.params;
  if (!quiltroId) {
    return res.status(400).send();
  }
  try {
    const quiltro = await Quiltro.findOne({ _id: quiltroId });
    if (!quiltro) {
      return res.status(404).send();
    } else {
      return res.json(quiltro);
    }
  } catch (err) {
    return next(err);
  }
});

export default quiltrosRouter;
