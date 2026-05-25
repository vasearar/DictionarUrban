import { Schema, model, models } from "mongoose";

const wordSchema = new Schema({
  word: String,
  definition: String,
  exampleOfUsing: String,
  username: String,
  userEmail: String,
  likes: Number,
  date: String,
  hidden: { type: Boolean, default: false },
  hiddenAt: Date,
  hiddenBy: String,
  hiddenReason: String,
});

const wordModel = models.wordModel || model("wordModel", wordSchema, "words");

export default wordModel;
