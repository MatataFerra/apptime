import { getTranslations } from "next-intl/server";

import { PATH_NAMES } from "@/utils/constants/pathnames";

import { Link } from "@/i18n/navigation";

export default async function SuccessPage() {
  const t = await getTranslations("auth");

  return (
    <div className="flex flex-col space-y-12 self-center">
      <p className="text-center text-2xl font-semibold">{t("forgot.success")}</p>
      <Link
        href={PATH_NAMES.HOME}
        className={
          "flex h-12 w-full cursor-pointer items-center justify-center rounded-lg border border-border-strong bg-surface p-3 text-center text-lg text-ink transition-all hover:bg-surface-sunken"
        }
        role="button"
      >
        {t("go_home")}
      </Link>
    </div>
  );
}
