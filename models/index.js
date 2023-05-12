import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema({
  username: String,
  password: String,
});

export const User = model("User", userSchema);

const amigoSchema = new Schema({
  species: String,
  last_seen_address: String,
  last_seen_date: Date,
  name: String,
  gender: String,
  description: String,
  message: String,
  photo_url: String,
  owner_id: String,
  stray: Boolean,
  outdoor_amigo: Boolean,
  missing: Boolean, // combination w found will make alerts etc
  found: Boolean, // vice versa
});

export const Amigo = model("Amigo", amigoSchema);
