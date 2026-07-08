import { Schema, model, models } from "mongoose";

// Cerere în așteptare de legare a unui cont anonim de un email real.
// Parola aleasă stă aici DOAR ca hash bcrypt — user doc-ul anonim rămâne
// fără parolă până la confirmarea emailului (swap atomic la confirmare).
const emailChangeTokenSchema = new Schema({
  anonEmail: { type: String, required: true },
  newEmail: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

// TTL: MongoDB curăță singur cererile expirate; expirarea se verifică
// oricum și în cod (TTL-ul rulează cu întârziere de până la un minut).
emailChangeTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const emailChangeTokenModel =
  models.emailChangeTokenModel ||
  model("emailChangeTokenModel", emailChangeTokenSchema, "emailChangeTokens");

export default emailChangeTokenModel;
