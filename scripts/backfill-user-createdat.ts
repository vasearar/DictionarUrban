/**
 * Backfill one-off: populează `users.createdAt` pentru conturile vechi.
 *
 * De ce: medaliile de vechime au nevoie de o dată calculabilă, dar `users.date`
 * e un string localizat ro-RO ("12 martie 2024") scris la înregistrare — nu se
 * poate compara și nici sorta. Conturile noi primesc `createdAt` direct din
 * register/contact; ăsta le rezolvă pe cele existente.
 *
 * Rulare (o singură dată, din rădăcina proiectului):
 *   npx tsx scripts/backfill-user-createdat.ts
 *   npx tsx scripts/backfill-user-createdat.ts --dry-run   (doar raportează)
 *
 * Idempotent: atinge doar userii fără `createdAt`, deci se poate re-rula fără
 * grijă. Motorul de medalii are oricum un fallback lazy (derivă din `_id` și
 * face `$set`), deci scriptul e o optimizare, nu o condiție de funcționare.
 */

process.loadEnvFile(); // .env din rădăcină — tsx nu trece prin next.config

import mongoose from "mongoose";
import userModel from "../models/userModel";

const MONTHS_RO: Record<string, number> = {
  ianuarie: 0,
  februarie: 1,
  martie: 2,
  aprilie: 3,
  mai: 4,
  iunie: 5,
  iulie: 6,
  august: 7,
  septembrie: 8,
  octombrie: 9,
  noiembrie: 10,
  decembrie: 11,
};

type Source = "iso" | "ro-RO" | "objectid";

/** Întoarce data + de unde a venit, ca raportul să arate ce s-a ghicit. */
function deriveCreatedAt(date: unknown, id: mongoose.Types.ObjectId): { at: Date; source: Source } {
  if (typeof date === "string" && date.trim()) {
    const text = date.trim();

    // Fallback-urile de pe server salvează ISO ("2026-07-09T...").
    if (/^\d{4}-\d{2}-\d{2}T/.test(text)) {
      const parsed = new Date(text);
      if (!isNaN(parsed.getTime())) return { at: parsed, source: "iso" };
    }

    // Formatul localizat scris la înregistrare: "12 martie 2024".
    const match = text.match(/^(\d{1,2})\s+([a-zăîșțâ]+)\s+(\d{4})$/i);
    if (match) {
      const month = MONTHS_RO[match[2].toLowerCase()];
      if (month !== undefined) {
        // UTC: `date` a fost generat cu timeZone "UTC", deci nu introducem un
        // decalaj de fus reinterpretând-o local.
        const parsed = new Date(Date.UTC(Number(match[3]), month, Number(match[1])));
        if (!isNaN(parsed.getTime())) return { at: parsed, source: "ro-RO" };
      }
    }
  }

  // Neparsabil sau lipsă → timestamp-ul din ObjectId (momentul inserării).
  return { at: id.getTimestamp(), source: "objectid" };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI lipsește din .env — nu am unde să mă conectez.");
    process.exit(1);
  }

  await mongoose.connect(uri);

  const users = await userModel
    .find({ createdAt: { $exists: false } })
    .select("_id date")
    .lean<{ _id: mongoose.Types.ObjectId; date?: string }[]>();

  if (users.length === 0) {
    console.log("Nimic de făcut: toți userii au deja createdAt.");
    await mongoose.disconnect();
    return;
  }

  const tally: Record<Source, number> = { iso: 0, "ro-RO": 0, objectid: 0 };
  const operations = users.map((user) => {
    const { at, source } = deriveCreatedAt(user.date, user._id);
    tally[source]++;
    return {
      updateOne: {
        filter: { _id: user._id },
        update: { $set: { createdAt: at } },
      },
    };
  });

  console.log(`Useri fără createdAt: ${users.length}`);
  console.log(`  din date ISO:        ${tally.iso}`);
  console.log(`  din date ro-RO:      ${tally["ro-RO"]}`);
  console.log(`  din _id (fallback):  ${tally.objectid}`);

  if (dryRun) {
    console.log("\n--dry-run: nu am scris nimic.");
  } else {
    const result = await userModel.bulkWrite(operations);
    console.log(`\nScris: ${result.modifiedCount} useri actualizați.`);
  }

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("Backfill eșuat:", error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
