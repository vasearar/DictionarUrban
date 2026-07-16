/**
 * Verifică dacă `users.email` poate primi un index UNIQUE și, cu `--apply`, îl pune.
 *
 * De ce e nevoie de script și nu ajunge `unique: true` în schemă:
 *
 *  1. Build-ul unui index unique EȘUEAZĂ dacă în colecție există deja dubluri.
 *     De aici verificarea de mai jos, care trebuie să treacă prima.
 *
 *  2. În DB există deja `email_1` NON-unique. `autoIndex` din Mongoose doar
 *     CREEAZĂ indexurile lipsă — nu le și modifică. `createIndex` cu aceleași
 *     chei dar alte opțiuni întoarce IndexOptionsConflict (cod 85), iar eroarea
 *     e înghițită în tăcere la pornirea appului: ai crede că e unique, dar nu e.
 *     Deci indexul vechi trebuie ȘTERS și recreat — exact ce face `--apply`.
 *
 * Rulare (din rădăcina proiectului):
 *   npx tsx scripts/unique-email-index.ts           → doar raportează, nu scrie
 *   npx tsx scripts/unique-email-index.ts --apply   → drop + create unique
 *
 * ATENȚIE: `.env` indică DB-ul de PRODUCȚIE (vezi memoria local-dev-hits-production).
 *
 * Folosește driverul brut, nu modelele: importul lui `userModel` ar declanșa
 * `autoIndex` și ar crea indexuri ca efect secundar, exact ce vrem să controlăm aici.
 */

process.loadEnvFile(); // .env din rădăcină — tsx nu trece prin next.config

import mongoose from "mongoose";

const INDEX_NAME = "email_1";

async function main() {
  const apply = process.argv.includes("--apply");
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI lipsește din .env — nu am unde să mă conectez.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  const users = mongoose.connection.db!.collection("users");

  // Grupează după email. Documentele fără câmpul `email` cad toate în grupul
  // `null` — și ele ar rupe indexul unique, fiindcă Mongo tratează câmpul lipsă
  // ca `null`. Deci aceeași interogare prinde ambele cazuri.
  const conflicts = await users
    .aggregate<{ _id: unknown; n: number; ids: unknown[] }>([
      { $group: { _id: "$email", n: { $sum: 1 }, ids: { $push: "$_id" } } },
      { $match: { n: { $gt: 1 } } },
      { $sort: { n: -1 } },
    ])
    .toArray();

  console.log(`Conturi: ${await users.countDocuments()}`);

  if (conflicts.length > 0) {
    console.log(`\n❌ Nu se poate: ${conflicts.length} grup(uri) în conflict.\n`);
    for (const c of conflicts) {
      const eticheta = c._id === null ? "(fără email)" : String(c._id);
      console.log(`  ${eticheta} → ${c.n} conturi: ${c.ids.map(String).join(", ")}`);
    }
    console.log("\nRezolvă întâi dublurile (șterge/fuzionează conturile), apoi re-rulează.");
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log("✅ Niciun email duplicat — indexul unique poate fi construit.");

  const existing = await users.indexes();
  const current = existing.find((i) => i.name === INDEX_NAME);
  console.log(`Index curent «${INDEX_NAME}»: ${current ? (current.unique ? "unique" : "NON-unique") : "absent"}`);

  if (current?.unique) {
    console.log("Nimic de făcut: e deja unique.");
    await mongoose.disconnect();
    return;
  }

  if (!apply) {
    console.log("\n(raport) Rulează cu --apply ca să înlocuiesc indexul cu unul unique.");
    await mongoose.disconnect();
    return;
  }

  // Fereastra dintre drop și create e de ordinul milisecundelor pe 8 conturi;
  // în acest interval `findOne({email})` degenerează în collection scan, dar nu
  // e incorect. Alternativa (creare sub alt nume + drop) lasă două indexuri pe
  // aceeași cheie, ceea ce încurcă planner-ul.
  if (current) {
    await users.dropIndex(INDEX_NAME);
    console.log(`Șters indexul non-unique «${INDEX_NAME}».`);
  }
  await users.createIndex({ email: 1 }, { unique: true, name: INDEX_NAME });
  console.log(`✅ Creat «${INDEX_NAME}» UNIQUE.`);
  console.log("\nAcum pune și în models/userModel.ts:");
  console.log("  userSchema.index({ email: 1 }, { unique: true });");

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Eșuat:", error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
