import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { Resend } from "resend";

import PasswordService from "@/services/Auth/password";

import type { Locale } from "@/types";

import { EmailTemplate } from "@/components/ui/EmailTemplate";

import { isLocale } from "@/utils/helpers/locale";

import { translatorFor } from "@/i18n/translator";
import prisma from "#/prisma/client";

/** Locale of the page that asked for the reset, from the redirect it passed. */
function localeFromResetUrl(url: string): Locale {
  try {
    const callback = new URL(url).searchParams.get("callbackURL") ?? "";
    const locale = callback.split("/").filter(Boolean)[0];
    return isLocale(locale) ? locale : "en";
  } catch {
    return "en";
  }
}

/** Endpoints that set a password, and the body field it comes in. */
const PASSWORD_FIELD_BY_PATH: Record<string, string> = {
  "/sign-up/email": "password",
  "/reset-password": "newPassword",
  "/change-password": "newPassword",
  "/set-password": "newPassword",
};

const baseURL = process.env.BETTER_AUTH_URL ?? process.env.NEXTAUTH_URL;

/**
 * Better Auth (replaces next-auth). Email + password (scrypt) and Google,
 * database sessions in the Session table, cached in a signed cookie for
 * 5 minutes so most requests don't hit Turso.
 */
export const auth = betterAuth({
  appName: "CasualApp",
  baseURL,
  // Vercel previews live on their own host; let them sign in too.
  trustedOrigins: process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : [],
  // The old env names keep working until they're renamed.
  secret: process.env.BETTER_AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "sqlite" }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    revokeSessionsOnPasswordReset: true,
    async sendResetPassword({ user, url, token }) {
      const locale = localeFromResetUrl(url);
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error } = await resend.emails.send({
        from: `CasualApp Team <resetpassword@${process.env.RESEND_SENDER}>`,
        to: user.email,
        subject:
          process.env.RESEND_SUBJECT ?? translatorFor(locale)("email.reset_password.subject"),
        // Links to our own page (/{locale}/reset/{token}), which calls resetPassword.
        react: EmailTemplate({
          firstName: user.name,
          url: `${(baseURL ?? "").replace(/\/$/, "")}/`,
          locale,
          endpoint: "reset",
          token,
        }),
      });
      if (error) throw new Error(`Reset email failed: ${error.message}`);
    },
  },

  // Same password rules as the register and reset forms, enforced here too:
  // the forms are only the client, and /api/auth/* can be called directly.
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      const field = PASSWORD_FIELD_BY_PATH[ctx.path];
      const password = field ? (ctx.body as Record<string, unknown> | undefined)?.[field] : null;
      if (typeof password === "string" && !new PasswordService(password).validPassword().valid) {
        throw new APIError("BAD_REQUEST", { message: "Password is not valid" });
      }
    }),
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },

  account: {
    // A Google sign-in with the same email joins the existing account.
    accountLinking: { enabled: true, trustedProviders: ["google"] },
  },

  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "USER", input: false },
      type_account: {
        type: "string",
        required: false,
        defaultValue: "CREDENTIALS",
        input: false,
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days, as before
    updateAge: 60 * 60 * 24,
    // How long a revoked session (password reset, deleted account, admin
    // role removed) can keep working on another device. Shorter means more
    // database reads; 2 minutes keeps most navigation off Turso.
    cookieCache: { enabled: true, maxAge: 2 * 60 },
  },

  databaseHooks: {
    user: {
      create: {
        // Every user needs their Shift container (shifts hang from it) and
        // a Config row, as the old register flow created.
        async after(user) {
          await prisma.shift.upsert({
            where: { userId: user.id },
            create: { userId: user.id },
            update: {},
          });
          await prisma.config.upsert({
            where: { userId: user.id },
            create: { userId: user.id, weekStartsOn: "monday" },
            update: {},
          });
        },
      },
    },
  },

  // In the database, not in memory: on Vercel each instance had its own
  // counts, so the limit barely held. Defaults: 100 per 10 s, sign-in and
  // sign-up 3 per 10 s, password reset 3 per minute, per IP.
  rateLimit: { storage: "database" },

  // Sets cookies from server actions (sign in/out called on the server).
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
