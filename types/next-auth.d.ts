import { DefaultSession } from "next-auth";

// Extindem tipurile next-auth ca `role` să fie disponibil pe sesiune și JWT,
// tipat (fără `any`) în tot codul. Rolul e populat în callback-urile din auth.ts.
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}
