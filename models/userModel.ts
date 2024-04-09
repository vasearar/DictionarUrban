import { Schema, model, models, mongo } from "mongoose";

const userSchema = new Schema({
  email: String,
  username: String,
  role: String,
});

const userModel = models.userModel || model("userModel", userSchema);

export default userModel;