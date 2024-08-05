"use server";

import PasswordService from "@/services/Auth/password";

import prisma from "#/prisma/client";

type ResetPasswordInputs = {
  token: string;
  password: string;
};

export default async function onResetPassword(data: ResetPasswordInputs) {
  const isPasswordValid = new PasswordService(data.password).validPassword();

  if (!isPasswordValid.valid) {
    return {
      response: false,
      message: "Password is not valid",
    };
  }

  const passwordResetToken = await prisma.passwordResetToken.findUnique({
    where: {
      token: data.token,
      createdAt: {
        gt: new Date(Date.now() - 1000 * 60 * 15), //900.000 ms -> 15 min,
      },
      resetAt: null,
    },
  });

  if (!passwordResetToken) {
    return {
      message: "Token expires or the link is incorrect",
      response: false,
    };
  }

  const hashPassword = await PasswordService.hashPassword(data.password);

  const updateUser = prisma.user.update({
    where: {
      id: passwordResetToken.userId,
    },
    data: {
      password: hashPassword,
    },
  });

  const updateToken = prisma.passwordResetToken.update({
    where: {
      id: passwordResetToken.id,
    },
    data: {
      resetAt: new Date(),
    },
  });

  try {
    const [user, token] = await prisma.$transaction([updateUser, updateToken]);

    if (!user) {
      return {
        response: false,
        message:
          "Something happend whit the update. Please try loggin with your new password, if the problem continues try again.",
      };
    }

    return {
      response: true,
      message: "Password has been updated succefully",
    };
  } catch (error) {
    return {
      response: false,
      message: "An error occurr, please try again. We will check the error soon",
    };
  }
}
