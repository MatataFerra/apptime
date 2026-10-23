"use server";

import PasswordService from "@/services/Auth/password";

import type { ActionResult } from "@/types/i18n";

import { auth } from "@/utils/auth";

type ResetPasswordInputs = {
  token: string;
  password: string;
};

/** Sets the new password with the token from the reset email (Better Auth). */
export default async function onResetPassword(data: ResetPasswordInputs): Promise<ActionResult> {
  // Same password rules as registering.
  if (!new PasswordService(data.password).validPassword().valid) {
    return { response: false, error: "password_invalid" };
  }

  try {
    await auth.api.resetPassword({ body: { newPassword: data.password, token: data.token } });
    return { response: true };
  } catch {
    return { response: false, error: "reset_link_invalid" };
  }
}
