import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import userModel from "../../../models/userModel";
import { authConfig } from "@/app/confings/auth";
import { isDuplicateKeyError } from "@/lib/mongoErrors";
import { getClientIp, enforceRateLimits } from "@/lib/antispam";
import { validateUsername, sameUsernameQuery } from "@/lib/username";

// Câmpurile care pleacă înapoi la client. Răspunsul întorcea documentul întreg,
// deci și hash-ul de parolă — e contul propriu al apelantului, dar hash-ul n-are
// ce căuta pe fir.
const SAFE_USER_FIELDS = "username date role createdAt";

const MONGO_URI = process.env.MONGO_URI!;

// Creează înregistrarea de user pentru contul autentificat (flux OAuth → alegere poreclă).
// Securitate:
//  - emailul vine DIN SESIUNE, nu din body (nu poți crea cont pentru alt email);
//  - rolul e forțat "user" — niciodată din body, ca să nu se poată injecta
//    role:"admin" (mass-assignment / escaladare de privilegii).
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Ruta ASTA creează conturi, iar providerul `anonym` emite sesiuni gratis și
    // nelimitat — deci sesiunea nu e o barieră, IP-ul e singura plasă reală.
    // Pragul pe oră e generos intenționat: publicul e Gen Z, deci un liceu întreg
    // poate veni de pe un singur NAT (sau de pe CGNAT mobil).
    // Alegerea poreclei e prin încercări (e luată, mai încerci, faci o typo), deci
    // pragul pe cont e larg: unul strâns ar bloca omul la a patra încercare și
    // nu și-ar mai putea termina înregistrarea. Oricum n-ar apăra nimic —
    // fiecare sesiune anonimă are alt email, deci un script cere doar o sesiune
    // nouă și primește găleată nouă. IP-ul e singura plasă care ține.
    const ip = getClientIp(req);
    const limited = await enforceRateLimits([
      { scope: "contact-ip", id: ip, limit: 10, windowMs: 60_000 },
      { scope: "contact-ip", id: ip, limit: 60, windowMs: 3_600_000 },
      { scope: "contact", id: email, limit: 20, windowMs: 3_600_000 },
    ]);
    if (limited) return limited;

    const body = await req.json();
    const username = typeof body?.username === "string" ? body.username.trim() : "";

    // Validarea trăia doar în client (`verifyUsername`), deci un apel direct
    // putea seta orice lungime/caracter. Aceleași reguli ca la register.
    const invalid = validateUsername(username);
    if (invalid) {
      return NextResponse.json({ error: invalid }, { status: 400 });
    }

    await mongoose.connect(MONGO_URI);

    // Unicitate insensibilă la majuscule/diacritice, ca lookup-ul de profil.
    // Era potrivire exactă, deci „marius" trecea pe lângă „Marius" și amândoi
    // ajungeau pe același profil — gaura de impersonare închisă în register și
    // /api/username, dar ratată exact aici, pe calea principală de creare cont.
    // `$ne: email` exclude propriul cont, ca re-trimiterea aceleiași porecle
    // să nu se auto-blocheze.
    const existingUsername = await userModel
      .findOne({ username: sameUsernameQuery(username), email: { $ne: email } })
      .select("_id")
      .lean();
    if (existingUsername) {
      return NextResponse.json({ error: "Acestă poreclă deja se folosește" }, { status: 409 });
    }

    // contul are deja o înregistrare → nu o dublăm/suprascriem
    const existingUser = await userModel.findOne({ email }).select(SAFE_USER_FIELDS);
    if (existingUser) {
      return NextResponse.json({ someProp: existingUser }, { status: 200 });
    }

    let created: unknown;
    try {
      const doc = await userModel.create({
        email, // din sesiune, nu din body
        username,
        role: "user", // forțat — niciodată din body
        date: typeof body?.date === "string" ? body.date : new Date().toISOString(),
        createdAt: new Date(), // din server — `date` poate veni localizat din body
        likes: [],
      });
      // Aceleași câmpuri ca ramurile de mai sus — `create` întoarce documentul
      // întreg, iar noi nu trimitem înapoi decât ce folosește UI-ul.
      created = { username: doc.username, date: doc.date, role: doc.role, createdAt: doc.createdAt };
    } catch (error) {
      if (!isDuplicateKeyError(error)) throw error;
      // Cursă cu o cerere paralelă (ex. dublu-click pe finalizarea OAuth): contul
      // a apărut între `findOne` și `create`. Ramura de mai sus întoarce oricum
      // 200 cu contul existent, deci facem la fel — nu e o eroare pentru user.
      created = await userModel.findOne({ email }).select(SAFE_USER_FIELDS);
    }

    return NextResponse.json({ someProp: created }, { status: 200 });
  } catch (error) {
    console.log("Something went wrong", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Returnează datele minime ale UTILIZATORULUI AUTENTIFICAT (nu ale unui email arbitrar).
// Emailul vine din sesiune, deci nu se mai poate enumera rolul altor conturi.
export async function GET() {
  try {
    const session = await getServerSession(authConfig);
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await mongoose.connect(MONGO_URI);
    const user = await userModel.findOne({ email });
    if (user) {
      return NextResponse.json(
        {
          username: user.username,
          date: user.date,
          role: user.role,
          // e contul propriu al apelantului — UI-ul decide dacă arată
          // butonul „Schimbă parola" (conturile Google/anonime n-au parolă)
          hasPassword: Boolean(user.password),
        },
        { status: 200 }
      );
    }
    return NextResponse.json({ exists: false }, { status: 201 });
  } catch (error) {
    console.log("Something went wrong", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
