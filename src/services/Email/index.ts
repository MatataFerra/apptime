import type { ReactElement } from "react";

import { render, toPlainText } from "@react-email/render";
import { Resend } from "resend";

import "server-only";

/**
 * Sends one of the app's emails through Resend, from
 * "NomadShift <{local}@RESEND_SENDER>". It goes as HTML and plain text (a
 * text part is one of the things spam filters look for; Resend doesn't add
 * one on its own), with an optional Reply-To so replies reach a real inbox.
 */
export async function sendEmail({
  local,
  to,
  subject,
  email,
}: {
  /** The part before the @, e.g. "account". */
  local: string;
  to: string;
  subject: string;
  email: ReactElement;
}) {
  const html = await render(email);
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: `NomadShift <${local}@${process.env.RESEND_SENDER}>`,
    to,
    subject,
    html,
    text: toPlainText(html),
    ...(process.env.RESEND_REPLY_TO && { replyTo: process.env.RESEND_REPLY_TO }),
  });
  if (error) throw new Error(`Email "${subject}" failed: ${error.message}`);
}
