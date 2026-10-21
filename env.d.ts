import { z } from "zod";

export const envSchema = z.object({
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  DATABASE_URL: z.string(),
  NEXT_PUBLIC_API_MOCKING: z.string().optional(),
  /** Better Auth. Falls back to NEXTAUTH_SECRET / NEXTAUTH_URL until renamed. */
  BETTER_AUTH_SECRET: z.string().optional(),
  BETTER_AUTH_URL: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().optional(),
  /** Set by Vercel: the deployment's own host (previews included). */
  VERCEL_URL: z.string().optional(),
  NEXT_PUBLIC_SHOW_DEVTOOLS: z.string(),
  NEXT_PUBLIC_TURSO_DATABASE_URL: z.string(),
  TURSO_ON: z.string(),
  STAGING: z.string(),
  GATEWAY_URL: z.string(),
  GATEWAY_SECRET: z.string(),
  GATEWAY_PASSWORD: z.string(),
  JWT_SECRET: z.string(),
  RESEND_API_KEY: z.string(),
  RESEND_SENDER: z.string(),
  RESEND_SUBJECT: z.string(),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
