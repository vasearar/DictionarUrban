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

// Medalia „Vedeta cartierului" caută definiția cu cele mai multe like-uri la
// fiecare like primit; medaliile de definiții/like-uri numără sau însumează per
// autor. Fără indexuri, ambele ar face collection scan pe hot-path-ul de like.
wordSchema.index({ likes: -1 });
wordSchema.index({ userEmail: 1 });

const wordModel = models.wordModel || model("wordModel", wordSchema, "words");

export default wordModel;
