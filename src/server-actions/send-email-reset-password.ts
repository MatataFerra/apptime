"use server";

import { randomUUID } from "crypto";
import { Resend } from "resend";

import { EmailTemplate } from "@/components/ui/EmailTemplate";

import prisma from "#/prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function onSendEmailToResetPassword(email: string, locale?: string) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return {
      message: "Email has been sent to: " + email,
    };
  }

  const passwordResetToken = await prisma.passwordResetToken.findFirst({
    where: {
      userId: user.id,
      createdAt: {
        gt: new Date(Date.now() - 1000 * 60 * 15), //900.000 ms -> 15 min
      },
      resetAt: null,
    },
  });

  if (passwordResetToken) {
    return {
      response: false,
      message:
        "You have already recieved and email for change your password, please check your inbox again",
    };
  }

  const token = await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token: `${randomUUID()}${randomUUID()}`.replace(/-/g, ""),
    },
  });

  const { data, error } = await resend.emails.send({
    from: "CasualApp Team <resetpassword@inchequeable.com.ar>",
    to: user.email,
    subject: "Please reset your password",
    react: EmailTemplate({
      firstName: user.name,
      url: process.env.NEXTAUTH_URL!,
      locale: locale ?? "en",
      endpoint: "reset",
      token: token.token,
    }),
  });

  if (error) {
    return {
      response: false,
      error,
    };
  }

  await prisma.passwordResetToken.update({
    where: {
      id: token.id,
    },
    data: {
      emailId: data?.id,
    },
  });

  return {
    message: "Email sent",
    response: true,
  };
}
