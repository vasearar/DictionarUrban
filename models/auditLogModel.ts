import { Schema, model, models } from "mongoose";

const auditLogSchema = new Schema(
  {
    actorEmail: { type: String, required: true },
    actorRole: { type: String, required: true },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: String, required: true },
    targetEmail: String,
    details: Schema.Types.Mixed,
  },
  { timestamps: true }
);

const auditLogModel =
  models.auditLogModel || model("auditLogModel", auditLogSchema, "auditLogs");

export default auditLogModel;
