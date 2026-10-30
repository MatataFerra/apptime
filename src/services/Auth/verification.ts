/**
 * A new account gets this long to confirm its email. Until then it works as
 * usual; after it, the account only sees the "confirm your email" page
 * (resend the link or sign out) until the address is confirmed.
 *
 * No dependencies: the proxy imports this on every page request.
 */
export const EMAIL_VERIFY_GRACE_MS = 8 * 60 * 60 * 1000;

type VerifiableUser = { emailVerified?: boolean | null; createdAt?: Date | string | null };

/**
 * True when the account hasn't confirmed its email and the grace period is
 * over. Google accounts come verified, so this never applies to them.
 */
export function isVerificationOverdue(user: VerifiableUser | null | undefined, now = Date.now()) {
  if (!user || user.emailVerified) return false;
  if (!user.createdAt) return false;
  const created = new Date(user.createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return now - created > EMAIL_VERIFY_GRACE_MS;
}
