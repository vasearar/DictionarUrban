import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import userModel from "@/models/userModel";
import { checkRateLimits, getClientIpFromHeaders } from "@/lib/antispam";

export const authConfig: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Email și parolă",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Parolă", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Introdu email-ul și parola");
        }

        // Fără limită aici, ruta de login era brute-force de parolă la discreție.
        // Limităm și pe IP (un atacator care încearcă multe conturi), și pe email
        // (un atacator distribuit care încearcă multe parole pe un cont anume).
        const ip = getClientIpFromHeaders(req?.headers);
        const loginEmail = credentials.email.toLowerCase();
        const blocked = await checkRateLimits([
          { scope: "login-ip", id: ip, limit: 10, windowMs: 60_000 },
          { scope: "login-ip", id: ip, limit: 60, windowMs: 3_600_000 },
          { scope: "login-email", id: loginEmail, limit: 5, windowMs: 60_000 },
          { scope: "login-email", id: loginEmail, limit: 20, windowMs: 3_600_000 },
        ]);
        if (blocked) {
          throw new Error("Prea multe încercări. Încearcă din nou peste puțin timp.");
        }

        await connectDB();
        const user = await userModel.findOne({ email: credentials.email });

        if (!user || !user.password) {
          throw new Error("Email sau parolă incorectă");
        }

        if (user.banned) {
          throw new Error("Contul tău a fost blocat");
        }

        if (!user.emailVerified) {
          throw new Error("Email-ul nu a fost verificat. Verifică-ți inbox-ul");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Email sau parolă incorectă");
        }

        return {
          id: user._id.toString(),
          name: user.username,
          email: user.email,
        };
      },
    }),
    CredentialsProvider({
      id: "anonym",
      name: "Conectare anonimă",
      credentials: {
        username: { label: "Username", type: "text" },
      },
      async authorize(credentials, req) {
        const randomID = Math.random().toString(36).substring(2, 15);
        const fakeEmail = `anon_${randomID}@no-reply.localhost`;

        const user = {
          id: randomID,
          name: "Musafir",
          email: fakeEmail,
        };

        if (!user) return null;

        return user;
      },
    }),
  ],
  pages: {
    signIn: '/conectare',
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string;
        session.user.email = token.email as string;
        session.user.role = (token.role as string) || "user";
      }
      return session;
    },

    async jwt({ token, user, trigger }) {
      // La autentificare (sau la un refresh explicit) citim rolul din DB o
      // singură dată și îl stocăm în token → navbar-ul și restul UI-ului îl
      // au instant din sesiune, fără fetch pe fiecare render.
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
      }

      if (user || trigger === "update" || token.role === undefined) {
        try {
          await connectDB();
          const dbUser = await userModel.findOne({ email: token.email });
          token.role = dbUser?.role || "user";
        } catch {
          token.role = token.role || "user";
        }
      }

      return token;
    },
  },
};
