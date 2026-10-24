"use client";

import { useId, useState } from "react";

import { useTranslations } from "next-intl";

import { currencyForCountry } from "@/services/Employer/currency";
import {
  parseEmployerText,
  PASTE_FIELDS,
  type PastedEmployer,
  type PasteField,
} from "@/services/Employer/paste";

import Button from "@/components/ui/Button";

/**
 * A box to paste an email signature, payslip header or job ad into. It shows
 * what it recognised before anything goes into the form.
 */
function PasteDetails({
  current,
  onFill,
}: {
  /** The form's values, to say which ones a fill would replace. */
  current: Partial<Record<PasteField, string>>;
  onFill: (fields: PastedEmployer, guessed: PasteField[]) => void;
}) {
  const [text, setText] = useState("");
  const id = useId();
  const t = useTranslations("employers.paste");
  const tf = useTranslations("employers.fields");
  const { fields, guessed } = parseEmployerText(text);
  // In the form's order, not the order they were found in.
  const found = PASTE_FIELDS.filter((field) => fields[field]).map(
    (field) => [field, fields[field] as string] as const
  );

  return (
    <div className="flex flex-col gap-3">
      <label htmlFor={id} className="flex flex-col gap-1 text-[0.8125rem] text-ink-muted">
        {t("label")}
        <textarea
          id={id}
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            "Sunny Farms Pty Ltd\nABN 51 824 753 556\n12 Packhouse Rd, Bundaberg QLD 4670"
          }
          className="w-full rounded-xl border border-border-strong bg-surface px-3 py-2.5 text-[0.875rem] text-ink outline-hidden placeholder:text-ink-subtle focus:border-accent"
        />
      </label>

      {text.trim() && found.length === 0 ? (
        <p className="text-[0.8125rem] text-ink-muted">{t("nothing")}</p>
      ) : null}

      {found.length > 0 ? (
        <>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-xl bg-surface-sunken px-3 py-2.5 text-[0.8125rem]">
            {found.map(([field, value]) => {
              const replaces = !!current[field]?.trim() && current[field]?.trim() !== value;
              return (
                <div key={field} className="contents">
                  <dt className="text-ink-muted">{tf(field)}</dt>
                  <dd className="min-w-0 break-words text-ink">
                    {value}
                    {guessed.includes(field) ? (
                      <span className="text-ink-muted"> · {t("guessed")}</span>
                    ) : null}
                    {replaces ? (
                      <span className="text-ink-muted">
                        {" "}
                        · {t("replaces", { value: current[field] ?? "" })}
                      </span>
                    ) : null}
                  </dd>
                </div>
              );
            })}
            {currencyForCountry(fields.country) ? (
              <div className="contents">
                <dt className="text-ink-muted">{t("currency")}</dt>
                <dd className="text-ink">{currencyForCountry(fields.country)}</dd>
              </div>
            ) : null}
          </dl>
          <Button
            type="button"
            size="md"
            classes="w-full"
            onClick={() => {
              onFill(fields, guessed);
              setText("");
            }}
          >
            {t("fill", { count: found.length })}
          </Button>
        </>
      ) : null}
    </div>
  );
}

export default PasteDetails;
