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
  isAnonymous: Boolean,
  tenantId: String,
  providerData: Object,
  metadata: Object,
});

export const User = model("User", userSchema);

const statusEventSchema = new Schema({
  quiltroId: String,
  time: Date,
  location: String,
});

export const StatusEvent = model("StatusEvent", statusEventSchema);

const quiltroSchema = new Schema({
  name: String,
  age: String,
  favoriteFoods: String,
  cannotOrWontEat: String,
  location: String,
  photoUrl: String,
  requestedItems: String,
  lastStatusEvent: Object,
  uid: Object, // effectively this will be the reporter and the "admin", no admin mode..if you report it and register you will have to auth and then you are the admin for this quiltro
  quiltroId: String,
  // requested_items: '',
  // medical_issues: '',
  // medical_history: '',
  // health_issues: '',
  // chip_id: '',
  // nose_id: '',
});

export const Quiltro = model("Quiltro", quiltroSchema);

// TODO use postgres :)
export const subscriberMapSchema = new Schema({
  quiltroToUserMap: Object,
  userToQuiltroMap: Object
})

export const SubscriberMap = model("SubscriberMap", subscriberMapSchema)

