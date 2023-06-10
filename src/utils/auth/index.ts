import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "#/prisma/client";

//TODO: Cuando se quiere crear un usuario con oauth2, lanza una excepción porque password es requerido y oauth no lo provee

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "email and password",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@example.com",
        },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user?.password) return null;

        if (!user || !(await compare(credentials.password, user.password)))
          return null;

        return {
          ...user,
          id: user.id.toString(),
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user, account }) {
      token.accessToken = account?.access_token;

      if (account?.type === "credentials") {
        token.user = user;
      }

      console.log("🚀 ~ file: index.ts:57 ~ jwt ~ { token, user, account }:", {
        token,
        user,
        account,
      });

      return token;
    },
    async session({ session, token, user }) {
      if (typeof token.accessToken === "string") {
        session.accessToken = token.accessToken;
      }
      console.log(
        "🚀 ~ file: index.ts:70 ~ session ~ { session, token, user }:",
        { session, token, user }
      );
      return session;
    },
  },
};
