import mongoose from "mongoose";

const { Schema, model } = mongoose;

export const userSchema = new Schema({
  phoneNumber: String,
  joinedOn: Date,
});

export const User = model("User", userSchema);

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
  amigoId: String,
  status: String,
  time: Date,
  details: Object,
  photoUrl: String,
});

export const StatusEvent = model("StatusEvent", statusEventSchema);

const amigoSchema = new Schema({
  species: String,
  lastSeenLocation: String,
  lastSeenDate: Date,
  name: String,
  status: String, // permittedStatus
  sex: String,
  description: String,
  photoUrl: String,
  ownerId: String,
  stray: Boolean,
  isOwnerAware: Boolean, // can figure out later what the implications are but important to distinguish when the owner is *actually* taking care of the animal
  lastStatusEvent: Object,
  lastUpdatedAt: Date,
  user: Object, // TODO this doesn't allow for changes, need to switch to Postgres
});

export const Amigo = model("Amigo", amigoSchema);
