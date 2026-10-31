import { redirect } from "next/navigation";

import VerifyEmailNotice from "@/components/structures/VerifyEmail/Notice";

import { getSessionIncludingUnverified } from "@/utils/auth/session";
import { PATH_NAMES } from "@/utils/constants/pathnames";

/**
 * Where an account lands once its grace period to confirm the email is
 * over (the proxy sends it here from every other page).
 */
export default async function VerifyEmailPage({ params }: PageProps<"/[locale]/verify-email">) {
  const { locale } = await params;
  const session = await getSessionIncludingUnverified();
  if (!session) redirect(`/${locale}${PATH_NAMES.LOGIN}`);

  return <VerifyEmailNotice email={session.user.email} />;
}
