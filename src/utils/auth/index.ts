import { NextAuthOptions } from "next-auth";
import { AuthService, UserService } from "@/services";
import _ from "lodash";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "#/prisma/client";

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

        const user = await UserService.findUniqueUser({
          email: credentials.email,
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
      const sessionAccessToken = _.assign(sessionDeepClone, {
        accessToken: token.accessToken,
        type_account: token.type_account,
      });

      AuthService.oauthUser({
        email: sessionAccessToken.user?.email ?? "",
        name: sessionAccessToken.user?.name ?? "",
        image: sessionAccessToken.user?.image ?? "",
      });

      return sessionAccessToken;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.type_account = account.provider;
      }
      const tokenClone = _.cloneDeep(token);

      return tokenClone;
    },
  },
};
