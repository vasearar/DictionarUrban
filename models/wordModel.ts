import { Schema, model, models, mongo } from "mongoose";

const wordSchema = new Schema({
  word: String,
  definition: String,
  exampleOfUsing: String,
  username: String,
  userEmail: String,
  likes: Number,
  date: String,
});

const wordModel = models.wordModel || model("wordModel", wordSchema);

export default wordModel;