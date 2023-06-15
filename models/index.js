import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema({
  username: String,
  password: String,
});

export const User = model("User", userSchema);

// will try to enforce but just the idea of the lifecycle here. lost and found are exclusive i think at least for UI purposes
const permittedStatus = ["lost", "found", "sighted", "claimed", "reunited"];

const statusEventSchema = new Schema({
  amigoId: String,
  status: String,
  time: Date,
  details: String,
});

export const StatusEvent = model("StatusEvent", statusEventSchema);

const amigoSchema = new Schema({
  species: String,
  last_seen_address: String,
  last_seen_date: Date,
  name: String,
  status: String, // permittedStatus
  sex: String,
  description: String,
  message: String,
  photo_url: String,
  owner_id: String,
  stray: Boolean,
  owner_aware: Boolean, // can figure out later what the implications are but important to distinguish when the owner is *actually* taking care of the animal
  last_status_event: String, // json object of statusEventSchema
});

export const Amigo = model("Amigo", amigoSchema);
