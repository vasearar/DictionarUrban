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

const reportModel = models.reportModel || model("reportModel", reportSchema, "reports");

export default reportModel;
