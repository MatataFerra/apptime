/* eslint-disable no-console */

/**
 * Gives an existing user the ADMIN role (or takes it away with --revoke).
 * Run it against the database in your env file; nothing in the app can
 * grant the role over HTTP.
 *
 *   pnpm admin:promote someone@example.com
 *   pnpm admin:promote someone@example.com --revoke
 *
 * Uses .env.local; for another database, run the same command with
 * `dotenv -e <file> --` in front of ts-node.
 */
import prisma from "./client";

const ADMIN = "ADMIN";
const USER = "USER";

export async function setAdmin(email: string, admin: boolean) {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, email: true, role: true },
  });
  if (!user) return { ok: false as const, error: `No user with email ${email}` };

  const role = admin ? ADMIN : USER;
  if (user.role === role) return { ok: true as const, changed: false, role };

  await prisma.user.update({ where: { id: user.id }, data: { role } });
  // Sessions carry the role in the cookie cache; signing out everywhere
  // makes the change apply now instead of within the cache window.
  await prisma.session.deleteMany({ where: { userId: user.id } });
  return { ok: true as const, changed: true, role };
}

async function main() {
  const args = process.argv.slice(2);
  const email = args.find((arg) => !arg.startsWith("--"));
  const revoke = args.includes("--revoke");

  if (!email) {
    console.error("Usage: pnpm admin:promote <email> [--revoke]");
    process.exitCode = 1;
    return;
  }

  const result = await setAdmin(email, !revoke);
  if (!result.ok) {
    console.error(result.error);
    process.exitCode = 1;
    return;
  }
  console.log(
    result.changed
      ? `${email} is now ${result.role}. Their sessions were signed out.`
      : `${email} was already ${result.role}.`
  );
}

if (require.main === module) {
  main().finally(() => prisma.$disconnect());
}
