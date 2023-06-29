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
  from: String,
  recipient_id: String,
  amigo_id: String,
  title: String,
  body: String,
  data: Object,
  time_sent: Date,
  time_read: Date,
  expo_message_id: String,
});

export const Message = model("Message", messageSchema);

// lost when created unless found
// found when confirmed another user has control, can send message and create status event but not update actual status
// reunited when original owner confirms
// found and unidentified just gets put in found status, in UI check no owner ID to distinguish
export const PERMITTED_AMIGO_STATUSES = ["lost", "found", "reunited"];

// useful for the UI
export const PERMITTED_STATUS_EVENT_STATUSES = ["sighted", "claimed"].concat(
  PERMITTED_AMIGO_STATUSES
);

const statusEventSchema = new Schema({
  amigo_id: String,
  status: String,
  time: Date,
  details: Object,
  photo_url: String,
});

export const StatusEvent = model("StatusEvent", statusEventSchema);

const amigoSchema = new Schema({
  species: String,
  last_seen_location: String,
  last_seen_date: Date,
  name: String,
  status: String, // permittedStatus
  sex: String,
  description: String,
  photo_url: String,
  owner_id: String,
  stray: Boolean,
  owner_aware: Boolean, // can figure out later what the implications are but important to distinguish when the owner is *actually* taking care of the animal
  last_status_event: Object,
  last_updated_at: Date,
});

export const Amigo = model("Amigo", amigoSchema);
