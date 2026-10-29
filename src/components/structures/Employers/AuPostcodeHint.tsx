"use client";

import { CircleAlert, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

import { type AuState, checkPostcode, parsePostcode } from "@/services/Visa/australia";

import { cn } from "@/utils/helpers/styleMerger";

/**
 * Under an Australian employer's address: whether the postcode is in a
 * specified-work area (regional, northern, remote) for the 2nd and 3rd
 * Working Holiday visas, and whether it fits the state typed. Only a hint:
 * it never blocks saving.
 */
function AuPostcodeHint({
  postcode,
  region,
  onUseState,
}: {
  postcode: string;
  region: string;
  /** Puts the postcode's state in the region field. */
  onUseState: (state: AuState) => void;
}) {
  const t = useTranslations("employers.form.au_postcode");
  const check = checkPostcode(postcode, region);
  if (check.kind === "empty") return null;

  const value = postcode.trim();
  const warning = check.kind !== "ok" || check.areas.length === 0;
  let message: string;
  if (check.kind === "invalid") {
    message = parsePostcode(value) === null ? t("four_digits") : t("unknown", { postcode: value });
  } else if (check.areas.length === 0) {
    message = t("no_area", { postcode: value });
  } else {
    message = t("areas", {
      postcode: value,
      areas: check.areas.map((area) => t(`area.${area}`)).join(" · "),
    });
  }

  const Icon = warning ? CircleAlert : MapPin;
  const state = check.kind === "invalid" ? null : check.state;
  const showState = state !== null && !region.trim();

  return (
    <div
      data-testid="au-postcode-hint"
      className={cn(
        "flex items-start gap-2 rounded-xl px-3 py-2 text-[0.8125rem]",
        warning ? "bg-destructive-soft text-ink" : "bg-surface-sunken text-ink-muted"
      )}
    >
      <Icon
        className={cn("mt-0.5 size-3.5 shrink-0", warning ? "text-destructive" : "text-ink-subtle")}
        aria-hidden="true"
      />
      <div className="flex min-w-0 flex-col items-start gap-1">
        {check.kind === "state_mismatch" ? (
          <>
            <p>
              {t("state_mismatch", { postcode: value, state: check.state, typed: check.typed })}
            </p>
            <button
              type="button"
              onClick={() => onUseState(check.state)}
              className="font-semibold text-accent"
            >
              {t("use_state", { state: check.state })}
            </button>
          </>
        ) : (
          <>
            <p>{message}</p>
            {showState ? (
              <button
                type="button"
                onClick={() => onUseState(state)}
                className="font-semibold text-accent"
              >
                {t("use_state", { state })}
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export default AuPostcodeHint;
