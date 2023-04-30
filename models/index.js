import mongoose from "mongoose";

const amigoSchema = new mongoose.Schema({
  species: String,
  last_seen_address: String,
  name: String,
  description: String,
  message: String,
  photo_url: String,
  owner_id: Number,
  owner_number: String,
  stray: Boolean,
  outdoor_amigo: Boolean,
});

export const Amigo = mongoose.model("Amigo", amigoSchema);

const userSchema = new mongoose.Schema({
  username: String,
  phone_number: String,
})

export const User = mongoose.model("User", userSchema);
