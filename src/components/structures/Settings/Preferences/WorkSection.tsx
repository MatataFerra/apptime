"use client";

import { useId } from "react";

import { useTranslations } from "next-intl";

import { ChoicePopover } from "@/components/ui/Choice";

import { ROUND_STEPS, type RoundStep } from "@/utils/helpers/roundShift";
import useEmployers from "@/hooks/useEmployers";
import usePreferences from "@/hooks/usePreferences";

import NumberSetting from "./NumberSetting";
import { Row, Section } from "./Section";
import Segmented from "./Segmented";

const NONE = "none";

/** How new shifts are prefilled and calculated: employer, holiday pay, rounding. */
function WorkSection() {
  const { config, save } = usePreferences();
  const { employers } = useEmployers();
  const t = useTranslations("settings.work");
  const employerId = useId();

  const defaultEmployer = config?.defaultEmployerId;
  // A default that was archived or deleted shows as "None" (it isn't prefilled either).
  const selected =
    defaultEmployer != null && employers.some((e) => e.id === defaultEmployer)
      ? String(defaultEmployer)
      : NONE;
  const round = (ROUND_STEPS as readonly number[]).includes(config?.roundMinutes ?? 0)
    ? (String(config?.roundMinutes ?? 0) as `${RoundStep}`)
    : "0";

  return (
    <Section title={t("title")} description={t("description")}>
      <Row label={t("default_employer")} hint={t("default_employer_hint")} htmlFor={employerId}>
        <ChoicePopover
          id={employerId}
          label={t("default_employer")}
          value={selected}
          className="h-10 max-w-40 shrink-0 rounded-xl text-[0.9375rem]"
          options={[
            { value: NONE, label: t("no_employer") },
            ...employers.map((e) => ({ value: String(e.id), label: e.name })),
          ]}
          onChange={(value) => save({ defaultEmployerId: value === NONE ? null : Number(value) })}
        />
      </Row>
      <NumberSetting
        label={t("holiday_rate")}
        hint={t("holiday_rate_hint")}
        value={config?.holidayRate ?? 1.5}
        unit="×"
        min={1}
        max={5}
        onSave={(holidayRate) => holidayRate != null && save({ holidayRate })}
      />
      <Row label={t("rounding")} hint={t("rounding_hint")} stacked>
        <Segmented
          label={t("rounding")}
          value={round}
          onChange={(value) => save({ roundMinutes: Number(value) })}
          options={ROUND_STEPS.map((step) => ({
            value: String(step) as `${RoundStep}`,
            label: step === 0 ? t("exact") : t("minutes", { count: step }),
          }))}
        />
      </Row>
    </Section>
  );
}

export default WorkSection;
