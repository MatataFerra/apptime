"use client";

import { type ReactNode } from "react";

import { Ban, CircleCheck, CircleHelp } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  type AuSubclass,
  eligibility,
  VISA_WORK_TYPES,
  type VisaCountry,
} from "@/services/VisaReport";

import { ChoicePopover } from "@/components/ui/Choice";

import { cn } from "@/utils/helpers/styleMerger";

const SUBCLASSES: AuSubclass[] = ["417", "462"];

/** "417 · counts" with an icon by status. */
function Line({ visa, status, children }: { visa: string; status: string; children: ReactNode }) {
  const Icon = status === "eligible" ? CircleCheck : status === "not_eligible" ? Ban : CircleHelp;
  return (
    <li
      className={cn(
        "flex items-center gap-1.5",
        status === "eligible" && "text-insight-ink",
        status === "not_eligible" && "text-warning",
        status === "unknown" && "text-ink-muted"
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="font-semibold">{visa}</span>
      <span>· {children}</span>
    </li>
  );
}

/**
 * For employers in Australia or New Zealand: the kind of work (what the
 * visa extension counts), and in Australia the postcode where it's done when
 * it isn't the address. Below, whether it counts for each visa.
 */
function VisaWorkFields({
  country,
  workType,
  onWorkType,
  postcode,
  workPostcode,
  workPostcodeField,
}: {
  country: VisaCountry;
  workType: string;
  onWorkType: (type: string) => void;
  /** The address postcode, used when there's no work postcode. */
  postcode: string;
  workPostcode: string;
  /** The work postcode input (the form's own field, with its errors). */
  workPostcodeField: ReactNode;
}) {
  const t = useTranslations("employers.form");
  const tw = useTranslations("extensions.work_types");
  const id = `visa-work-type-${country}`;
  const types = VISA_WORK_TYPES[country] as readonly string[];
  const value = types.includes(workType) ? workType : "";
  const data = { visaWorkType: value || null, postcode, workPostcode };

  function message(check: ReturnType<typeof eligibility>) {
    if (check.status === "eligible") return t("eligibility.eligible");
    const shown = (workPostcode || postcode).trim();
    return t(`eligibility.${check.reason}`, { postcode: shown });
  }

  const lines =
    country === "AU"
      ? SUBCLASSES.map((subclass) => ({
          visa: t(`eligibility.visa_${subclass}`),
          check: eligibility(data, "AU", subclass),
        }))
      : [{ visa: t("eligibility.visa_NZ"), check: eligibility(data, "NZ") }];

  return (
    <>
      <div className="flex flex-col gap-1 text-[0.8125rem] text-ink-muted">
        <label htmlFor={id}>{t("work_type")}</label>
        <ChoicePopover
          id={id}
          variant="field"
          label={t("work_type")}
          value={value || undefined}
          placeholder={t("work_type_placeholder")}
          testId="employer-work-type"
          display={(type) => tw(type as "other")}
          options={[
            ...types.map((type) => ({ value: type, label: tw(type as "other") })),
            { value: "", label: t("work_type_none"), muted: true, separated: true },
          ]}
          onChange={onWorkType}
        />
      </div>
      {country === "AU" ? (
        <div className="flex flex-col gap-1">
          {workPostcodeField}
          <p className="text-[0.75rem] text-ink-subtle">{t("work_postcode_hint")}</p>
        </div>
      ) : null}
      {value ? (
        <ul className="flex flex-col gap-1 text-[0.8125rem]" data-testid="employer-eligibility">
          {lines.map(({ visa, check }) => (
            <Line key={visa} visa={visa} status={check.status}>
              {message(check)}
            </Line>
          ))}
        </ul>
      ) : (
        <p className="text-[0.8125rem] text-ink-subtle">{t("visa_hint")}</p>
      )}
    </>
  );
}

export default VisaWorkFields;
