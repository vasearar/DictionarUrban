import { Schema, model, models } from "mongoose";

// O medalie deblocată. Sub-schemă fără `_id` propriu: sunt maximum 34 de intrări
// per user, citite mereu odată cu userul, deci array embedded (nu colecție
// separată). Grant-ul e atomic: `$push` cu gardă `"achievements.id": {$ne: id}`
// în filtru → `modifiedCount === 1` înseamnă „chiar acum s-a deblocat".
const achievementSchema = new Schema(
  {
    id: String,
    unlockedAt: Date,
    // false = trebuie încă arătat un toast (deblocare asincronă, ex. un like
    // primit de la altcineva). Se marchează true după ack-ul clientului.
    notified: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new Schema({
  email: String,
  username: String,
  password: String,
  emailVerified: { type: Boolean, default: false },
  role: { type: String, enum: ["user", "moderator", "admin"], default: "user" },
  banned: { type: Boolean, default: false },
  date: String,
  likes: [String],
  achievements: [achievementSchema],
  // Medalia aleasă de user pentru profil (o singură medalie, nu toate).
  displayedAchievement: { type: String, default: null },
  // Data reală de înregistrare. `date` de mai sus e un string localizat ro-RO
  // ("12 martie 2024"), inutilizabil pentru calcule de vechime — de aici
  // câmpul ăsta. Vezi scripts/backfill-user-createdat.ts pentru conturile vechi.
  createdAt: Date,
});

const userModel = models.userModel || model("userModel", userSchema, "users");

export default userModel;
