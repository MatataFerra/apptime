"use client";

import { useMemo, useState } from "react";

import { startOfDay, subDays } from "date-fns";
import { CalendarX2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { historyEntries } from "@/services/History";
import { weekStartsOnIndex } from "@/services/Summary";
import {
  type AuSubclass,
  type CountingRule,
  firstShiftIn,
  programById,
  type VisaProgramId,
  visaReport,
} from "@/services/VisaReport";

import {
  PeriodPicker,
  ProgramPicker,
  RulePicker,
  SubclassPicker,
} from "@/components/structures/Extensions/Controls";
import {
  AssumedNotice,
  ReportCalendar,
  ReportEmployers,
  ReportGaps,
  ReportSummary,
} from "@/components/structures/Extensions/ReportSections";
import VisaReportSkeleton from "@/components/structures/Extensions/VisaReportSkeleton";

import useEmployers from "@/hooks/useEmployers";
import useHourlyShifts from "@/hooks/useHourlyShifts";
import useProductionShifts from "@/hooks/useProductionShifts";
import useUser from "@/hooks/useUser";

/** With no shift in the country yet, the period starts this many days back. */
const DEFAULT_DAYS_BACK = 90;

/**
 * Visa extension report: pick the visa and the period, and see the days of
 * work done there, who for, the breaks over three weeks and every day on a
 * calendar. Shifts without an employer inside the period count, in red.
 */
function VisaReport() {
  const t = useTranslations("extensions");
  const { data: hourly, isLoading: loadingHourly } = useHourlyShifts();
  const { data: production, isLoading: loadingProduction } = useProductionShifts();
  const { byId, isLoading: loadingEmployers } = useEmployers();
  const { data: user } = useUser();
  const weekStartsOn = weekStartsOnIndex(user?.config?.weekStartsOn);

  const [programId, setProgramId] = useState<VisaProgramId>("au-88");
  const [rules, setRules] = useState<Partial<Record<VisaProgramId, CountingRule>>>({});
  // One subclass for both Australian programs: it's the user's passport.
  const [subclass, setSubclass] = useState<AuSubclass>("417");
  // null: from the first shift in the country to today.
  const [period, setPeriod] = useState<{ from: Date; to: Date } | null>(null);

  const program = programById(programId);
  const rule = rules[programId] ?? program.rules[0];
  const entries = useMemo(() => historyEntries(hourly, production), [hourly, production]);

  const today = startOfDay(new Date());
  const defaultFrom = firstShiftIn(
    entries,
    byId,
    program.country,
    subDays(today, DEFAULT_DAYS_BACK)
  );
  const from = period?.from ?? defaultFrom;
  const to = period?.to ?? today;

  const report = visaReport(entries, byId, {
    program,
    rule,
    from,
    to,
    weekStartsOn,
    subclass: program.subclasses?.includes(subclass) ? subclass : program.subclasses?.[0],
  });

  if (loadingHourly || loadingProduction || loadingEmployers) return <VisaReportSkeleton />;

  const country = t(`countries.${program.country}`);

  return (
    <div className="flex flex-col gap-6" data-testid="visa-report">
      <ProgramPicker
        value={programId}
        onChange={(id) => {
          // Another country: its own first shift is a better start than the dates picked.
          if (programById(id).country !== program.country) setPeriod(null);
          setProgramId(id);
        }}
      />
      <SubclassPicker program={program} value={subclass} onChange={setSubclass} />
      <RulePicker
        program={program}
        value={rule}
        onChange={(next) => setRules((current) => ({ ...current, [programId]: next }))}
      />
      <PeriodPicker
        from={from}
        to={to}
        country={program.country}
        isDefault={period === null}
        onChange={setPeriod}
        onReset={() => setPeriod(null)}
      />

      {report.totalDays === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border-strong px-6 py-10 text-center">
          <CalendarX2 className="size-6 text-ink-subtle" aria-hidden="true" />
          <p className="text-[0.9375rem] font-semibold text-ink">{t("empty.title")}</p>
          <p className="text-[0.8125rem] text-ink-muted">{t("empty.body", { country })}</p>
        </div>
      ) : (
        <>
          <ReportSummary report={report} />
          <AssumedNotice days={report.assumedDays} />
          <ReportGaps report={report} />
          <ReportEmployers report={report} byId={byId} />
          <ReportCalendar report={report} weekStartsOn={weekStartsOn} />
        </>
      )}

      {report.excludedShifts > 0 ? (
        <p className="px-1 text-[0.8125rem] text-ink-muted">
          {t("excluded", { count: report.excludedShifts })}
        </p>
      ) : null}
      <p className="px-1 text-[0.8125rem] text-ink-subtle">{t("disclaimer")}</p>
    </div>
  );
}

export default VisaReport;
