import { Schema, model, models } from "mongoose";

const userSchema = new Schema({
  email: String,
  username: String,
  password: String,
  emailVerified: { type: Boolean, default: false },
  role: { type: String, enum: ["user", "moderator", "admin"], default: "user" },
  banned: { type: Boolean, default: false },
  date: String,
  likes: [String],
});

const userModel = models.userModel || model("userModel", userSchema, "users");

export default userModel;
