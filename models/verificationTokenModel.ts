import { Schema, model, models } from "mongoose";

const verificationTokenSchema = new Schema({
  email: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
});

const verificationTokenModel =
  models.verificationTokenModel ||
  model("verificationTokenModel", verificationTokenSchema, "verificationTokens");

export default verificationTokenModel;
