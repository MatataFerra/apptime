"use client";

import { useMemo } from "react";

import { differenceInCalendarDays, format } from "date-fns";
import { Target } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  type GoalPeriod,
  goalProgress,
  goalRange,
  summarizePeriod,
  weekStartsOnIndex,
} from "@/services/Summary";

import { cn } from "@/utils/helpers/styleMerger";
import useDateLocale from "@/hooks/useDateLocale";
import useMoney from "@/hooks/useMoney";
import useShiftsInCurrency from "@/hooks/useShiftsInCurrency";
import useUser from "@/hooks/useUser";

/**
 * The earnings goal from Settings for this week or month: earned so far
 * (before taxes, in the user's currency) against the goal, and what's left.
 * Nothing shows without a goal.
 */
function EarningsGoal() {
  const { data: user } = useUser();
  const t = useTranslations("home.goal");
  const locale = useDateLocale();
  const { hourly, production, currency } = useShiftsInCurrency();
  const money = useMoney(currency);
  const goal = user?.config?.earningsGoal ?? 0;
  const period: GoalPeriod = user?.config?.goalPeriod === "month" ? "month" : "week";
  const weekStartsOn = weekStartsOnIndex(user?.config?.weekStartsOn);

  const progress = useMemo(() => {
    const { from, to } = goalRange(period, { weekStartsOn });
    const { earned } = summarizePeriod(hourly, production, from, to);
    return { ...goalProgress(earned, goal), daysLeft: differenceInCalendarDays(to, new Date()) };
  }, [goal, hourly, period, production, weekStartsOn]);

  if (!goal) return null;

  const percent = Math.round(progress.ratio * 100);
  const title =
    period === "month"
      ? t("title_month", { month: format(new Date(), "LLLL", { locale }) })
      : t("title_week");

  return (
    <section
      aria-label={title}
      data-testid="earnings-goal"
      className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-accent-soft text-accent">
          <Target className="size-4.5" strokeWidth={2} aria-hidden="true" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="text-[0.8125rem] font-medium text-ink-muted first-letter:uppercase">
            {title}
          </h2>
          <p className="text-[0.9375rem] font-semibold text-ink tabular-nums">
            {t("of", {
              earned: money(progress.earned, { cents: false }),
              goal: money(progress.goal, { cents: false }),
            })}
          </p>
        </div>
        <span className="text-sm font-semibold text-ink tabular-nums">{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={title}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-2 w-full overflow-hidden rounded-full bg-surface-sunken"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500",
            progress.reached ? "bg-accent" : "bg-ink"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-[0.8125rem] text-ink-muted">
        {progress.reached
          ? t("reached")
          : t("remaining", {
              amount: money(progress.remaining, { cents: false }),
              days: Math.max(0, progress.daysLeft),
            })}
      </p>
    </section>
  );
}

export default EarningsGoal;
