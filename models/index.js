import mongoose from "mongoose";

const { Schema, model } = mongoose;

export const userSchema = new Schema({
  phoneNumber: String,
  joinedOn: Date,
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
// found for obvious pets that were found with no owner info
// reunited when original owner confirms
export const PERMITTED_AMIGO_STATUSES = ["lost", "found", "reunited"];

// lost can have events with status (sighted) or even (recovered) before finally reunited
// found just goes straight to reunited
export const PERMITTED_STATUS_EVENT_STATUSES = ["sighted", "recovered"].concat(
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
  user: Object, // TODO this doesn't allow for changes, need to switch to Postgres
});

export const Amigo = model("Amigo", amigoSchema);
