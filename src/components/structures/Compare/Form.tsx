"use client";

import type { ReactNode } from "react";

import { useTranslations } from "next-intl";

import Input from "@/components/ui/Input";

import { currencySymbol } from "@/utils/constants/currencies";
import { MODULE_THEMES, MODULES } from "@/utils/constants/modules";
import { PATH_NAMES } from "@/utils/constants/pathnames";
import { cn } from "@/utils/helpers/styleMerger";
import { useCurrency } from "@/hooks/useMoney";

import { useCompareStore } from "@/store/useCompareStore";

function Side({ path, title, children }: { path: string; title: string; children: ReactNode }) {
  const { theme, icon: Icon } = MODULES[path];
  const colors = MODULE_THEMES[theme];

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className={cn("flex items-center gap-2.5 px-4 py-3", colors.soft, colors.ink)}>
        <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
        <h2 className="text-[0.9375rem] font-bold">{title}</h2>
      </div>
      <div className="flex flex-col gap-2.5 px-4 pt-3.5 pb-4">{children}</div>
    </section>
  );
}

function CompareForm() {
  const { setProduction, setHourly, hourly, production } = useCompareStore((state) => state);
  const t = useTranslations("compare");
  const symbol = currencySymbol(useCurrency());

  return (
    <form className="flex w-full flex-col gap-3.5" onSubmit={(e) => e.preventDefault()}>
      <Side path={PATH_NAMES.PRODUCTION} title={t("per_piece")}>
        <div className="grid grid-cols-2 gap-2.5">
          <Input
            type="number"
            inputMode="decimal"
            name="itemValue"
            label={t("pay_per_piece")}
            measure={symbol}
            measurePlace="left"
            min={0}
            value={production.itemValue}
            onChange={(e) => setProduction({ itemValue: e.target.value })}
          />
          <Input
            type="number"
            inputMode="numeric"
            name="itemQuantity"
            label={t("pieces_a_day")}
            min={0}
            value={production.itemQuantity}
            onChange={(e) => setProduction({ itemQuantity: e.target.value })}
          />
        </div>
      </Side>

      <Side path={PATH_NAMES.TRACK} title={t("per_hour")}>
        <Input
          type="number"
          inputMode="decimal"
          name="hourlyWage"
          label={t("hourly_rate")}
          measure={symbol}
          measurePlace="left"
          min={0}
          value={hourly.hourlyWage}
          onChange={(e) => setHourly({ hourlyWage: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-2.5">
          <Input
            type="number"
            inputMode="numeric"
            name="hoursWorked"
            label={t("hours")}
            measure="h"
            min={0}
            value={hourly.hoursWorked}
            onChange={(e) => setHourly({ hoursWorked: e.target.value })}
          />
          <Input
            type="number"
            inputMode="numeric"
            name="minutesWorked"
            label={t("minutes")}
            measure="min"
            min={0}
            max={59}
            value={hourly.minutesWorked ?? ""}
            onChange={(e) => setHourly({ minutesWorked: e.target.value })}
          />
        </div>
      </Side>
    </form>
  );
}

export default CompareForm;
