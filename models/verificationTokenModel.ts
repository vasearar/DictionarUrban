import { Schema, model, models } from "mongoose";

const verificationTokenSchema = new Schema({
  email: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
});

// TTL: MongoDB șterge singur tokenurile expirate (24h). Fără el se adunau pe veci.
verificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Căutat/șters după email la retrimiterea verificării.
verificationTokenSchema.index({ email: 1 });

const verificationTokenModel =
  models.verificationTokenModel ||
  model("verificationTokenModel", verificationTokenSchema, "verificationTokens");

export default verificationTokenModel;
