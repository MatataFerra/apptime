import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";

function Ham() {
  const t = useTranslations("nav");

  return (
    <span className="flex size-10 items-center justify-center rounded-md text-ink transition-colors hover:bg-surface-sunken">
      <Menu className="size-6" strokeWidth={1.75} aria-hidden="true" />
      <span className="sr-only">{t("open_menu")}</span>
    </span>
  );
}

export default Ham;
