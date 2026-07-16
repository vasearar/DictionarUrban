import { Schema, model, models } from "mongoose";

const reportSchema = new Schema({
  wordId: String,
  reason: String,
  optional: String,
  userEmail: String,
  date: String,
  status: { type: String, enum: ["pending", "resolved", "dismissed"], default: "pending" },
  resolvedAt: Date,
  resolvedBy: String,
});

// Medaliile de raportări numără rapoartele rezolvate ale unui utilizator, la
// fiecare scanare completă. Fără index, ar fi collection scan.
reportSchema.index({ userEmail: 1, status: 1 });

const reportModel = models.reportModel || model("reportModel", reportSchema, "reports");

export default reportModel;
