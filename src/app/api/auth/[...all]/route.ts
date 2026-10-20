import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/utils/auth";

// Every Better Auth endpoint: sign-in/up/out, Google callback, session,
// password reset.
export const { GET, POST } = toNextJsHandler(auth);
