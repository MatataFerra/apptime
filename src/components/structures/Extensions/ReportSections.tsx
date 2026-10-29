"use client";

import type { ReactNode } from "react";

import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  max as maxDate,
  min as minDate,
  startOfMonth,
} from "date-fns";
import { CircleAlert, MoonStar } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import type { ReportDay, ReportEmployerBlock, VisaReport } from "@/services/VisaReport";

import type { SavedEmployer } from "@/types";

import { cn } from "@/utils/helpers/styleMerger";
import useDateLocale from "@/hooks/useDateLocale";

/** 7.5 -> "7.5", 8 -> "8" (in the app's language). */
function useHours() {
  const locale = useLocale();
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  return (minutes: number) => number.format(minutes / 60);
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="flex flex-col gap-0.5 px-1">
      <h2 className="text-sm font-semibold text-ink-muted">{title}</h2>
      {description ? <p className="text-[0.8125rem] text-ink-subtle">{description}</p> : null}
    </header>
  );
}

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-surface", className)}>
      {children}
    </div>
  );
}

/** "64 of 88 days", a bar split in confirmed and assumed days, and what's left. */
export function ReportSummary({ report }: { report: VisaReport }) {
  const t = useTranslations("extensions.summary");
  const hours = useHours();
  const target = report.program.targetDays;
  function share(days: number) {
    return `${Math.min(100, (days / target) * 100)}%`;
  }
  const reached = report.totalDays >= target;

  return (
    <section aria-label={t("title")} className="flex flex-col gap-2">
      <SectionHeader title={t("title")} />
      <Card className="flex flex-col gap-4 p-4">
        <div className="flex items-end justify-between gap-3">
          <p className="flex items-baseline gap-2">
            <span
              className="display-title text-5xl text-ink tabular-nums"
              data-testid="visa-total-days"
            >
              {report.totalDays}
            </span>
            <span className="text-[0.9375rem] text-ink-muted">{t("of_target", { target })}</span>
          </p>
          <p
            className={cn(
              "pb-1 text-sm font-semibold",
              reached ? "text-insight-ink" : "text-ink-muted"
            )}
          >
            {reached ? t("reached") : t("remaining", { count: report.remainingDays })}
          </p>
        </div>

        <div
          className="flex h-2.5 overflow-hidden rounded-full bg-surface-sunken"
          role="progressbar"
          aria-label={t("progress", { target })}
          aria-valuenow={Math.min(report.totalDays, target)}
          aria-valuemin={0}
          aria-valuemax={target}
        >
          <div className="h-full bg-insight" style={{ width: share(report.confirmedDays) }} />
          <div
            className="h-full bg-destructive"
            style={{ width: share(Math.min(report.assumedDays, target - report.confirmedDays)) }}
          />
        </div>

        <dl className="grid grid-cols-3 gap-2 text-[0.8125rem]">
          <div className="flex flex-col gap-0.5">
            <dt className="flex items-center gap-1.5 text-ink-muted">
              <span className="size-2 rounded-full bg-insight" aria-hidden="true" />
              {t("confirmed")}
            </dt>
            <dd className="text-[0.9375rem] font-semibold text-ink tabular-nums">
              {report.confirmedDays}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="flex items-center gap-1.5 text-ink-muted">
              <span className="size-2 rounded-full bg-destructive" aria-hidden="true" />
              {t("assumed")}
            </dt>
            <dd
              className={cn(
                "text-[0.9375rem] font-semibold tabular-nums",
                report.assumedDays > 0 ? "text-destructive" : "text-ink"
              )}
            >
              {report.assumedDays}
            </dd>
          </div>
          <div className="flex flex-col items-end justify-end text-right">
            <dd className="text-ink-muted tabular-nums">
              {t("hours", { hours: hours(report.minutes) })}
            </dd>
          </div>
        </dl>
      </Card>
    </section>
  );
}

/** The red warning: days that only count because they're inside the period. */
export function AssumedNotice({ days }: { days: number }) {
  const t = useTranslations("extensions.assumed_notice");
  if (days === 0) return null;

  return (
    <div
      role="note"
      className="flex gap-3 rounded-xl bg-destructive-soft px-4 py-3 text-[0.8125rem] text-ink"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
      <div className="flex flex-col gap-0.5">
        <p className="font-semibold text-destructive">{t("title", { count: days })}</p>
        <p className="text-ink-muted">{t("body")}</p>
      </div>
    </div>
  );
}

/** "12 Mar – 20 Apr · 40 days without work", for breaks over three weeks. */
export function ReportGaps({ report }: { report: VisaReport }) {
  const t = useTranslations("extensions.gaps");
  const locale = useDateLocale();

  return (
    <section aria-label={t("title")} className="flex flex-col gap-2">
      <SectionHeader title={t("title")} description={t("description")} />
      <Card className="divide-y divide-border">
        {report.gaps.length === 0 ? (
          <p className="px-4 py-3.5 text-[0.9375rem] text-ink-muted">{t("none")}</p>
        ) : (
          report.gaps.map((gap) => (
            <div
              key={gap.from.valueOf()}
              className="flex min-h-14 items-center gap-3 px-4 py-3"
              data-testid="visa-gap"
            >
              <MoonStar className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
              <p className="min-w-0 flex-1 text-[0.9375rem] text-ink tabular-nums">
                {format(gap.from, "d MMM", { locale })} – {format(gap.to, "PP", { locale })}
              </p>
              <p className="shrink-0 text-[0.8125rem] font-semibold text-ink-muted">
                {t("days", { count: gap.days })}
              </p>
            </div>
          ))
        )}
      </Card>
    </section>
  );
}

/** One employer: what the form asks (business number, address, contact), days and dates. */
function EmployerCard({
  block,
  employer,
}: {
  block: ReportEmployerBlock;
  employer: SavedEmployer | undefined;
}) {
  const t = useTranslations("extensions.employers");
  const locale = useDateLocale();
  const hours = useHours();
  const assumed = block.status === "assumed";

  const name = employer?.name ?? t("no_employer");
  const address = employer
    ? [
        employer.address,
        [employer.city, employer.region].filter(Boolean).join(" "),
        employer.country,
      ]
        .filter(Boolean)
        .join(", ")
    : "";
  const contact = employer
    ? [employer.contactName, employer.contactPhone, employer.contactEmail]
        .filter(Boolean)
        .join(" · ")
    : "";
  const rows: [string, string | null | undefined][] = [
    [
      t("dates"),
      `${format(block.first, "PP", { locale })} – ${format(block.last, "PP", { locale })}`,
    ],
    [t("tax_id"), employer?.taxId],
    [t("address"), address],
    [t("postcode"), employer?.postcode],
    [t("industry"), employer?.industry],
    [t("contact"), contact],
  ];

  return (
    <article
      className={cn("flex flex-col gap-3 px-4 py-3.5", assumed && "bg-destructive-soft/40")}
      data-testid="visa-employer"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3
            className={cn(
              "truncate text-[0.9375rem] font-semibold",
              assumed ? "text-destructive" : "text-ink"
            )}
          >
            {name}
          </h3>
          <p className="text-[0.8125rem] text-ink-muted">
            {[
              t("shifts", { count: block.shifts }),
              t("hours", { hours: hours(block.minutes) }),
              block.reason === "no_country" ? t("no_country") : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className={cn(
              "text-[0.9375rem] font-semibold tabular-nums",
              assumed ? "text-destructive" : "text-ink"
            )}
          >
            {t("days", { count: block.days })}
          </span>
          {assumed ? (
            <span className="rounded-full bg-destructive-soft px-2 py-0.5 text-xs font-semibold text-destructive">
              {t("assumed_badge")}
            </span>
          ) : null}
        </div>
      </header>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[0.8125rem]">
        {rows
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-ink-muted">{label}</dt>
              <dd className="min-w-0 break-words text-ink">{value}</dd>
            </div>
          ))}
      </dl>
    </article>
  );
}

export function ReportEmployers({
  report,
  byId,
}: {
  report: VisaReport;
  byId: Map<number, SavedEmployer>;
}) {
  const t = useTranslations("extensions.employers");
  if (report.employers.length === 0) return null;

  return (
    <section aria-label={t("title")} className="flex flex-col gap-2">
      <SectionHeader title={t("title")} description={t("description")} />
      <Card className="divide-y divide-border">
        {report.employers.map((block) => (
          <EmployerCard
            key={String(block.employerId)}
            block={block}
            employer={block.employerId === null ? undefined : byId.get(block.employerId)}
          />
        ))}
      </Card>
    </section>
  );
}

const DAY_STYLES = {
  confirmed: "bg-insight text-on-module",
  assumed: "bg-destructive text-white",
  filled: "bg-insight-soft text-insight-ink",
  filledAssumed: "bg-destructive-soft text-destructive",
} as const;

function dayStyle(day: ReportDay) {
  if (day.filled) return day.status === "assumed" ? DAY_STYLES.filledAssumed : DAY_STYLES.filled;
  return DAY_STYLES[day.status];
}

/**
 * Month grids of the period, each counted day coloured: worked (confirmed),
 * without employer (red) or added by a full-time week (soft).
 */
export function ReportCalendar({
  report,
  weekStartsOn,
}: {
  report: VisaReport;
  weekStartsOn: 0 | 1;
}) {
  const t = useTranslations("extensions.calendar");
  const locale = useDateLocale();
  const byKey = new Map(report.days.map((day) => [day.key, day]));
  if (report.days.length === 0) return null;

  // From the first to the last counted day: empty months at the ends add nothing.
  const first = report.days[0].date;
  const last = report.days[report.days.length - 1].date;
  const months = eachMonthOfInterval({ start: first, end: last });
  const weekdays = eachDayOfInterval({
    start: new Date(2024, 0, weekStartsOn === 1 ? 1 : 7),
    end: new Date(2024, 0, weekStartsOn === 1 ? 7 : 13),
  });

  function statusLabel(day: ReportDay) {
    if (day.status === "assumed") return t("assumed");
    return day.filled ? t("filled") : t("confirmed");
  }

  return (
    <section aria-label={t("title")} className="flex flex-col gap-2">
      <SectionHeader title={t("title")} />
      <Card className="flex flex-col gap-5 p-4">
        {months.map((month) => {
          const start = maxDate([startOfMonth(month), report.from]);
          const end = minDate([endOfMonth(month), report.to]);
          const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
          const offset = (getDay(days[0]) - weekStartsOn + 7) % 7;

          return (
            <div key={month.valueOf()} className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold text-ink capitalize">
                {format(month, "LLLL yyyy", { locale })}
              </h3>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {weekdays.map((weekday) => (
                  <span
                    key={weekday.valueOf()}
                    className="pb-0.5 text-ink-subtle"
                    aria-hidden="true"
                  >
                    {format(weekday, "EEEEE", { locale })}
                  </span>
                ))}
                {Array.from({ length: offset }, (_, i) => (
                  <span key={`pad-${i}`} aria-hidden="true" />
                ))}
                {days.map((date) => {
                  const day = byKey.get(format(date, "yyyy-MM-dd"));
                  const outside = date < start || date > end;
                  return (
                    <span
                      key={date.valueOf()}
                      className={cn(
                        "flex aspect-square items-center justify-center rounded-md tabular-nums",
                        day ? dayStyle(day) : outside ? "text-ink-subtle/50" : "text-ink-muted",
                        !day && isSameDay(date, new Date()) && "ring-1 ring-border-strong"
                      )}
                      aria-label={
                        day
                          ? t("day_label", {
                              date: format(date, "PP", { locale }),
                              status: statusLabel(day),
                            })
                          : undefined
                      }
                    >
                      {format(date, "d")}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}

        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border pt-3 text-[0.8125rem] text-ink-muted">
          {(
            [
              ["confirmed", DAY_STYLES.confirmed],
              ["assumed", DAY_STYLES.assumed],
              ...(report.rule === "full_time_weeks" ? [["filled", DAY_STYLES.filled]] : []),
            ] as ["confirmed" | "assumed" | "filled", string][]
          ).map(([key, style]) => (
            <li key={key} className="flex items-center gap-1.5">
              <span className={cn("size-3 rounded-sm", style)} aria-hidden="true" />
              {t(key)}
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
