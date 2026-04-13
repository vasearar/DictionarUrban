import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import userModel from "@/models/userModel";

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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Introdu email-ul și parola");
        }

        await connectDB();
        const user = await userModel.findOne({ email: credentials.email });

        if (!user || !user.password) {
          throw new Error("Email sau parolă incorectă");
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
    signIn: '/signIn',
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // When ready for cross-domain SSO, set:
        // domain: ".dexurban.com",
      },
    },
  },
  callbacks: {
    async session({ session, token }) {
      interface CustomUser {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        id?: string;
      }

      const user = session.user as CustomUser;

      if (token) {
        user.id = token.sub as string;
        user.email = token.email as string;
      }

      session.user = user;
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
  },
};
