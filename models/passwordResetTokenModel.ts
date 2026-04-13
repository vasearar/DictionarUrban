import { Schema, model, models } from "mongoose";

const passwordResetTokenSchema = new Schema({
  email: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
});

const passwordResetTokenModel =
  models.passwordResetTokenModel ||
  model("passwordResetTokenModel", passwordResetTokenSchema, "passwordResetTokens");

export default passwordResetTokenModel;
