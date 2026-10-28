"use client";

import { useTranslations } from "next-intl";

import { FIELD, Row } from "@/components/structures/Settings/Preferences/Section";
import Skeleton from "@/components/ui/Skeleton";

import useSettings from "@/hooks/useSettings";

/** Your name, saved with "Save details". */
function Inputs() {
  const { setValue, values, isLoading } = useSettings();
  const t = useTranslations("settings.details");

  return (
    <Row label={t("name")} hint={t("name_hint")} htmlFor="name" stacked>
      {isLoading ? (
        <Skeleton classes="h-11 w-full rounded-xl" />
      ) : (
        <input
          id="name"
          name="name"
          autoComplete="name"
          className={FIELD}
          value={values.account.name}
          onChange={(e) => setValue({ account: { ...values.account, name: e.target.value } })}
        />
      )}
    </Row>
  );
}

export default Inputs;
