import { useTranslations } from "next-intl";

import type { PassedErrors } from "@/types";

import Icon from "@/components/ui/Icons";

import { PASSWORD } from "@/utils/constants";

interface Props {
  errors: PassedErrors;
  password: string;
}

function List({ errors, password }: Props) {
  const t = useTranslations("auth.password_rules");

  return (
    <ul className="flex list-none flex-col gap-1.5 text-sm">
      {(Object.keys(PASSWORD.PASSWORD_REQUIREMENTS) as (keyof PassedErrors)[]).map((type) => {
        return (
          <li
            key={type}
            className={`flex items-center gap-2 ${
              password?.length > 0
                ? !errors[type]
                  ? "text-accent"
                  : "text-destructive"
                : "text-ink-muted"
            }`}
          >
            <Icon.check width={15} height={15} fill="currentColor" />
            {t(type)}
          </li>
        );
      })}
    </ul>
  );
}

export default List;
