import { type infer as Infer, z } from "zod";

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
  /** libsql:// URL of the Turso database. Server only. */
  TURSO_DATABASE_URL: z.string().optional(),
  /** Old name of TURSO_DATABASE_URL, read as a fallback. */
  NEXT_PUBLIC_TURSO_DATABASE_URL: z.string().optional(),
  TURSO_ON: z.string(),
  RESEND_API_KEY: z.string(),
  RESEND_SENDER: z.string(),
  RESEND_SUBJECT: z.string(),
  /** ABN Lookup web services GUID (free, abr.business.gov.au/Tools/WebServices). Unset: lookup off. */
  ABR_GUID: z.string().optional(),
  /** NZBN API subscription key (free, portal.api.business.govt.nz). Unset: NZ lookup off. */
  NZBN_API_KEY: z.string().optional(),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Infer<typeof envSchema> {}
  }
}
