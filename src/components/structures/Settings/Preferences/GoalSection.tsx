"use client";

import { useTranslations } from "next-intl";

import { currencySymbol } from "@/utils/constants/currencies";
import { useCurrency } from "@/hooks/useMoney";
import usePreferences from "@/hooks/usePreferences";

import NumberSetting from "./NumberSetting";
import { Row, Section } from "./Section";
import Segmented from "./Segmented";

/** An earnings goal for the week or the month, shown as a progress bar on Home. */
function GoalSection() {
  const { config, save } = usePreferences();
  const currency = useCurrency();
  const t = useTranslations("settings.goal");
  const period = config?.goalPeriod === "month" ? "month" : "week";

  return (
    <Section title={t("title")} description={t("description", { currency })}>
      <NumberSetting
        label={t("amount")}
        hint={t("amount_hint")}
        value={config?.earningsGoal}
        unit={currencySymbol(currency)}
        unitPlace="left"
        nullable
        max={10_000_000}
        onSave={(earningsGoal) => save({ earningsGoal })}
      />
      <Row label={t("period")} stacked>
        <Segmented
          label={t("period")}
          value={period}
          onChange={(value) => save({ goalPeriod: value })}
          options={[
            { value: "week", label: t("week") },
            { value: "month", label: t("month") },
          ]}
        />
      </Row>
    </Section>
  );
}

export default GoalSection;
