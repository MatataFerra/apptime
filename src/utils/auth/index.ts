import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware, getSessionFromCtx, isAPIError } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";

import PasswordService from "@/services/Auth/password";
import { sendEmail } from "@/services/Email";
import { sendSecurityNotice } from "@/services/Email/security";
import { consumeRateLimit } from "@/services/RateLimit";

import type { Locale } from "@/types";

import { EmailTemplate, VerifyEmailTemplate } from "@/components/ui/EmailTemplate";

import { isLocale } from "@/utils/helpers/locale";

import { translatorFor } from "@/i18n/translator";
import prisma from "#/prisma/client";

/** Locale of the page that asked (reset, email change), from the redirect it passed. */
function localeFromCallback(url: string): Locale {
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
/**
 * Reset and verification emails per recipient, checked where they're sent:
 * the server action has its own limits, but /api/auth/request-password-reset,
 * /send-verification-email and /change-email reach these callbacks directly
 * and Better Auth only limits them per IP (3 a minute). Over the budget the
 * email is skipped quietly; the response stays the same, so nothing tells
 * whether the address has an account.
 */
const EMAILS_PER_RECIPIENT = { window: 60 * 60, max: 3 };

async function withinRecipientBudget(kind: "reset" | "verify", to: string) {
  const ok = await consumeRateLimit(
    `${kind}-email:sent:${to.trim().toLowerCase()}`,
    EMAILS_PER_RECIPIENT
  );
  // eslint-disable-next-line no-console -- server log when an email is skipped
  if (!ok) console.warn(`[auth] ${kind} email skipped: recipient limit reached`);
  return ok;
}

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
    // "Your password was changed", to the account's own address.
    async onPasswordReset({ user }, request) {
      await sendSecurityNotice({
        to: user.email,
        name: user.name,
        kind: "password_changed",
        headers: request?.headers,
      });
    },
    async sendResetPassword({ user, url, token }) {
      if (!(await withinRecipientBudget("reset", user.email))) return;
      const locale = localeFromCallback(url);
      await sendEmail({
        local: "resetpassword",
        to: user.email,
        subject:
          process.env.RESEND_SUBJECT ?? translatorFor(locale)("email.reset_password.subject"),
        // Links to our own page (/{locale}/reset/{token}), which calls resetPassword.
        email: EmailTemplate({
          firstName: user.name,
          url: `${(baseURL ?? "").replace(/\/$/, "")}/`,
          locale,
          endpoint: "reset",
          token,
        }),
      });
    },
  },

  // Only used to confirm a new email from Settings (nothing is sent on sign
  // up). The link goes to /api/auth/verify-email, which applies the change
  // and redirects back to Settings.
  emailVerification: {
    expiresIn: 60 * 60,
    async sendVerificationEmail({ user, url }) {
      // user.email is the address being confirmed (the new one on a change).
      if (!(await withinRecipientBudget("verify", user.email))) return;
      const locale = localeFromCallback(url);
      await sendEmail({
        local: "account",
        to: user.email,
        subject: translatorFor(locale)("email.verify_email.subject"),
        email: VerifyEmailTemplate({ firstName: user.name, url, locale }),
      });
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
    // Heads-ups to the account's own address once a change went through.
    after: createAuthMiddleware(async (ctx) => {
      const returned = ctx.context.returned;
      if (!returned || isAPIError(returned)) return;

      if (ctx.path === "/change-password") {
        const user = (returned as { user?: { email: string; name: string } }).user;
        if (user) {
          await sendSecurityNotice({
            to: user.email,
            name: user.name,
            kind: "password_changed",
            headers: ctx.headers,
          });
        }
      }

      if (ctx.path === "/change-email") {
        // To the current address: if someone else asked, this is how you find out.
        const session = await getSessionFromCtx(ctx).catch(() => null);
        const newEmail = (ctx.body as { newEmail?: string } | undefined)?.newEmail;
        if (session && newEmail) {
          await sendSecurityNotice({
            to: session.user.email,
            name: session.user.name,
            kind: "email_change",
            headers: ctx.headers,
            newEmail: newEmail.toLowerCase(),
          });
        }
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
    // The new address must be confirmed from its inbox before it replaces
    // the current one (Settings → Account and security).
    changeEmail: { enabled: true },
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
    // A deactivated account (User.isActive false, set by an admin) can't get
    // a session by any route: email, Google, the sign-in after sign up.
    session: {
      create: {
        async before(session) {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { isActive: true },
          });
          if (user && !user.isActive) {
            throw new APIError("FORBIDDEN", {
              message: "This account is disabled",
              code: "ACCOUNT_DISABLED",
            });
          }
        },
      },
    },
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
