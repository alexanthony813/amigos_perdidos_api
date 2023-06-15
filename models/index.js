import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema({
  username: String,
  password: String,
});

export const User = model("User", userSchema);

// will try to enforce but just the idea of the lifecycle here. lost and found are exclusive i think at least for UI purposes.
// sighted vs found difference is if the user has secured the dog, might not allow sighted without account
// should automatically send message, next
const messageSchema = new Schema({
  sender_id: String,
  receiver_id: String,
  text: String,
  time_sent: Date,
  time_read: Date,
});

// "claimed" is tricky...want for dogs that are not identified but found
const permittedStatus = ["lost", "sighted", "found", "reunited"];

const statusEventSchema = new Schema({
  amigoId: String,
  status: String,
  time: Date,
  details: Object,
  photo_url: String,
});

export const StatusEvent = model("StatusEvent", statusEventSchema);

const amigoSchema = new Schema({
  species: String,
  last_seen_location: String,
  name: String,
  status: String, // permittedStatus
  sex: String,
  description: String,
  message: String,
  photo_url: String,
  owner_id: String,
  stray: Boolean,
  owner_aware: Boolean, // can figure out later what the implications are but important to distinguish when the owner is *actually* taking care of the animal
  last_status_event: Object, 
  last_updated_at: Date,
});

export const Amigo = model("Amigo", amigoSchema);
