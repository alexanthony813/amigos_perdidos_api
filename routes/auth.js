import bcrypt from "bcrypt";
import Joi from "Joi";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import validateWith from "../middleware/validation.js";
import auth from "../middleware/auth.js";
import express from "express";

const authRouter = express.Router();

authRouter.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    return res.json(users);
  } catch (err) {
    return res.send(usersStore.getUsers()); // wtf? TODO
  }
});

authRouter.post("/users", validateWith(userSchema), async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    return res.status(201).json(user);
  } catch (err) {
    return next(err);
  }
});

authRouter.post("/auth", validateWith(userSchema), async (req, res) => {
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

authRouter.post(
  "/expoPushTokens",
  [auth, validateWith({ token: Joi.string().required() })],
  (req, res) => {
    const user = usersStore.getUserById(req.user.userId);
    if (!user) return res.status(400).send({ error: "Invalid user." });

    user.expoPushToken = req.body.token;
    console.log("User registered for notifications: ", user);
    return res.status(201).send();
  }
);

export default authRouter;
