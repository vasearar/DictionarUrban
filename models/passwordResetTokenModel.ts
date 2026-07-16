import { Schema, model, models } from "mongoose";

const passwordResetTokenSchema = new Schema({
  email: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
});

// TTL: MongoDB șterge singur tokenurile expirate. Fără el se adunau pe veci —
// spre deosebire de emailChange/linkIntent, care aveau deja TTL.
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Fluxul de „am uitat parola" face `deleteMany({email})` înainte de fiecare token.
passwordResetTokenSchema.index({ email: 1 });

const passwordResetTokenModel =
  models.passwordResetTokenModel ||
  model("passwordResetTokenModel", passwordResetTokenSchema, "passwordResetTokens");

export default passwordResetTokenModel;
