import mongoose from "mongoose";

const { Schema, model } = mongoose;

export const userSchema = new Schema({
  joinedOn: Date,
  uid: String,
  displayName: String,
  accessToken: String,
  providerId: String,
  proactiveRefresh: Object,
  reloadUserInfo: Object,
  reloadListener: Object,
  auth: Object,
  stsTokenManager: Object,
  email: String,
  emailVerified: Boolean,
  phoneNumber: String,
  photoURL: String,
  tenantId: String,
  providerData: Object,
  metadata: Object,
  isAnonymous: Boolean, // will determine whether can...?
  isAdmin: Boolean,
  lastLoginAt: String,
  quiltroIds: Object,
});

export const User = model("User", userSchema);

export const statusEventStatuses = ["problem_denied", "problem_reported"];

const statusEventSchema = new Schema({
  quiltroId: String,
  time: Date,
  status: String,
  photoUrl: String,
  details: Object,
});

export const StatusEvent = model("StatusEvent", statusEventSchema);

const quiltroSchema = new Schema({
  quiltroId: String,
  uid: Object, // effectively this will be the reporter and the "admin", no admin mode..if you report it and register you will have to auth and then you are the admin for this quiltro
  name: String,
  age: String,
  favoriteFoods: String,
  allergies: String, // seems imoprtant but not sure how often it will be used
  description: String,
  location: String,
  photoUrl: String,
  lastReportedProblem: Object,
  isAdoptable: Boolean,
  flyerUrl: String,
  // requestedItems: Object, might come back
  // health_issues: '',
  // chip_id: '',
  // noseprint_id: '',
});

export const Quiltro = model("Quiltro", quiltroSchema);

const requestedItemSchema = new Schema({
  title: String,
  quiltroId: String,
  price: String,
  amountRaised: String,
  photoUrl: String,
  link: String,
});

export const RequestedItem = model("RequestedItem", requestedItemSchema);
