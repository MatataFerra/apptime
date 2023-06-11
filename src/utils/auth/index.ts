import { NextAuthOptions } from "next-auth";
import _ from "lodash";
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

        if (!credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (
          !user ||
          !(await compare(credentials.password, user.password ?? ""))
        )
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
    async session({ session, token }) {
      const sessionDeepClone = _.cloneDeep(session);
      const sessionAccessToken = {
        ...sessionDeepClone,
        accessToken: token.accessToken,
      };

      // eslint-disable-next-line no-console
      console.log("🚀 ~ file: index.ts:60 ~ session ~ session:", {
        sessionAccessToken,
      });

      return sessionAccessToken;
    },
    async jwt({ token, user, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
};
