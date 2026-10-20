import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import type { auth } from "@/utils/auth";

/** Better Auth on the client: sign in/up/out and password reset. Same origin. */
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});

/**
 * Signs out and loads `to` from scratch, so the server-rendered session
 * and the cached user data go away with it.
 */
export async function signOutAndLeave(to: string = "/") {
  await authClient.signOut().catch(() => null);
  window.location.assign(to);
}
