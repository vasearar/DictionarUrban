import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";

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
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.sub,
          email: token.email,
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    }
  }
};
