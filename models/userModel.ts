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

// `findOne({email})` rulează pe aproape fiecare cerere autentificată (callback-ul
// JWT, requireRole, like-uri, tot motorul de medalii). Fără index, fiecare era un
// collection scan — de aici lentoarea care crește cu numărul de conturi.
//
// `unique` închide și cursa TOCTOU din register/link-email, unde două cereri
// concurente treceau amândouă de `findOne` și creau același email. Duplicatele
// se tratează acum ca 409 (eroare Mongo 11000), nu ca 500 — vezi lib/mongoErrors.ts.
//
// Pe un DB EXISTENT, schimbarea asta nu e suficientă: `autoIndex` doar creează
// indexurile lipsă, nu le și modifică, iar createIndex cu alte opțiuni pe
// aceleași chei dă IndexOptionsConflict (85), înghițit în tăcere la pornire.
// Indexul vechi trebuie șters și recreat: `npx tsx scripts/unique-email-index.ts --apply`.
userSchema.index({ email: 1 }, { unique: true });

// Lookup-ul de profil după poreclă e insensibil la majuscule/diacritice, deci
// folosește un regex neancorat pe litera de bază și NU poate folosi indexul ăsta.
// Rămâne totuși util pentru potrivirile exacte (ex. verificarea de unicitate la
// register). Vezi lib/username.ts.
userSchema.index({ username: 1 });

const userModel = models.userModel || model("userModel", userSchema, "users");

export default userModel;
