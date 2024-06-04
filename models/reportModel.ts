import { Schema, model, models, mongo } from "mongoose";

const reportSchema = new Schema({
  wordId: String,
  reason: String,
  optional: String,
  userEmail: String,
  date: String,
});

const reportModel = models.reportModel || model("reportModel", reportSchema);

export default reportModel;