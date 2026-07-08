import { Schema, model, models } from "mongoose";

// Intenție de legare a unui cont anonim de Google. Tokenul opac traversează
// redirectul OAuth într-un cookie httpOnly și e validat contra acestui
// document la finalizare. Viață scurtă (10 min), single-use.
const linkIntentSchema = new Schema({
  anonEmail: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
});

linkIntentSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const linkIntentModel =
  models.linkIntentModel || model("linkIntentModel", linkIntentSchema, "linkIntents");

export default linkIntentModel;
