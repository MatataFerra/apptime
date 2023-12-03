import { compare } from "bcryptjs";
import { assign, cloneDeep } from "lodash";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import AuthService from "@/services/Auth";
import i18n from "@/services/i18n";
import UserService from "@/services/User";
import ut from "@/services/Utilities";

export async function GET(req: NextApiRequest & NextRequest, res: NextResponse & NextApiResponse) {
  const locale = new i18n("en").getLocale(req);

  return await NextAuth(req, res, {
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

          if (!user || !(await compare(credentials.password, user.password ?? ""))) return null;

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
      maxAge: 7 * 24 * 60 * 60, // 7 days
    },

    jwt: {
      secret: process.env.NEXTAUTH_SECRET,
      maxAge: 7 * 24 * 60 * 60,
    },

    pages: {
      signIn: `/${locale}/login`,
      newUser: `/${locale}/register`,
    },

    secret: process.env.NEXTAUTH_SECRET,

    callbacks: {
      async session({ session, token }) {
        const sessionDeepClone = cloneDeep(session);
        const sessionAccessToken = assign(sessionDeepClone, {
          accessToken: token.accessToken,
          type_account: token.type_account,
        });

        if (sessionAccessToken.type_account === "google") {
          AuthService.oauthUser({
            email: sessionAccessToken.user?.email ?? "",
            name: sessionAccessToken.user?.name ?? "",
            image: sessionAccessToken.user?.image ?? "",
          });
        }

        return sessionAccessToken;
      },
      async jwt({ token, account, session }) {
        if (account) {
          const userFounded = await UserService.findUniqueUser({
            email: token.email,
          });
          token.accessToken = account.access_token;
          token.type_account = account.provider;
          token.role = userFounded?.role ?? "NOT_FOUND";
        }
        const tokenClone = cloneDeep(token);

        return tokenClone;
      },

      async redirect({ url, baseUrl }) {
        const isMobile = ut.isMobile({ request: req });
        const parseUrl = new URL(baseUrl);
        parseUrl.searchParams.set("isMobile", isMobile.toString());

        return parseUrl.href;
      },
    },
  });
}

export async function POST(req: NextApiRequest & NextRequest, res: NextResponse & NextApiResponse) {
  const locale = new i18n("en").getLocale(req);

  return await NextAuth(req, res, {
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

          if (!user || !(await compare(credentials.password, user.password ?? ""))) return null;

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

    pages: {
      signIn: `/${locale}/login`,
      newUser: `/${locale}/register`,
    },

    secret: process.env.NEXTAUTH_SECRET,

    callbacks: {
      async session({ session, token }) {
        const sessionDeepClone = cloneDeep(session);
        const sessionAccessToken = assign(sessionDeepClone, {
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
          const userFounded = await UserService.findUniqueUser({
            email: token.email,
          });
          token.accessToken = account.access_token;
          token.type_account = account.provider;
          token.role = userFounded?.role ?? "NOT_FOUND";
        }
        const tokenClone = cloneDeep(token);

        return tokenClone;
      },
    },
  });
}
