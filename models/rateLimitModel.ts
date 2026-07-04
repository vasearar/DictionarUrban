import { Schema, model, models } from "mongoose";

// Contor de rate-limit pe fereastră fixă. Un document per (cheie, fereastră).
// `_id` = `${key}:${windowStart}`, deci incrementul este atomic prin upsert.
// `expiresAt` are index TTL → MongoDB curăță singur documentele expirate.
const rateLimitSchema = new Schema({
  _id: { type: String },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});

// TTL: șterge documentul exact când timpul `expiresAt` a trecut.
rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const rateLimitModel =
  models.rateLimitModel || model("rateLimitModel", rateLimitSchema, "rateLimits");

export default rateLimitModel;
