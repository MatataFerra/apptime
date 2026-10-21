"use server";

import PasswordService from "@/services/Auth/password";

import { auth } from "@/utils/auth";

type ResetPasswordInputs = {
  token: string;
  password: string;
};

/** Sets the new password with the token from the reset email (Better Auth). */
export default async function onResetPassword(data: ResetPasswordInputs) {
  // Same password rules as registering.
  if (!new PasswordService(data.password).validPassword().valid) {
    return { response: false, message: "Password is not valid" };
  }

  try {
    await auth.api.resetPassword({ body: { newPassword: data.password, token: data.token } });
    return { response: true, message: "Password has been updated successfully" };
  } catch {
    return { response: false, message: "The link expired or isn't valid. Ask for a new one." };
  }
}
