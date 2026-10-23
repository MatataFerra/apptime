import { useTranslations } from "next-intl";

import { MODULE_THEMES, MODULES } from "@/utils/constants/modules";
import { PATH_NAMES } from "@/utils/constants/pathnames";
import { cn } from "@/utils/helpers/styleMerger";

import { Link } from "@/i18n/navigation";

const ITEMS = [
  { path: PATH_NAMES.TRACK, key: "track" },
  { path: PATH_NAMES.FAST_CHARGE, key: "fast_charge" },
  { path: PATH_NAMES.PRODUCTION, key: "production" },
] as const;

/** The three ways to log work, each in its module colour. */
function Features() {
  const t = useTranslations("modules");

  return (
    <div className="grid w-full grid-cols-3 gap-3">
      {ITEMS.map(({ path, key }) => {
        const { theme, icon: Icon } = MODULES[path];
        const colors = MODULE_THEMES[theme];

        return (
          <Link
            key={path}
            href={path}
            data-testid={`option-card-${path.split("/")[1]}`}
            className={cn(
              "flex min-h-28 flex-col justify-between gap-5 rounded-xl p-4 transition-transform active:scale-[0.97]",
              colors.soft,
              colors.ink
            )}
          >
            <Icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
            <span className="text-[0.9375rem] font-semibold">{t(`${key}.title`)}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default Features;
