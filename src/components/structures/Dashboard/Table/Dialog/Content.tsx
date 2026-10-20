import { format } from "date-fns";
import isEmpty from "lodash/isEmpty";

import Pay from "@/services/Pay";
import ShiftService from "@/services/Shift";

import type { ShiftType } from "@/types";

import { MODULE_THEMES } from "@/utils/constants/modules";
import { isProductionShift } from "@/utils/helpers/isProductionShift";
import { cn } from "@/utils/helpers/styleMerger";
import useMoney from "@/hooks/useMoney";

type Props = {
  shift: ShiftType;
};

function when(date?: string | null) {
  if (!date) return "–";
  const d = new Date(date);
  return isNaN(d.valueOf()) ? "–" : format(d, "EEE d MMM, h:mm a");
}

/** Read-only view of a saved shift: pay first, then the details. */
function TableDialogContent({ shift }: Props) {
  const format$ = useMoney();
  // In the shift's own currency.
  function money(value: number) {
    return format$(value, { currency: shift.currency });
  }
  const production = isProductionShift(shift);
  const colors = MODULE_THEMES[production ? "production" : "track"];
  const pay = new Pay(shift);
  const gross = pay.gross() ?? 0;
  const net = pay.netPay() ?? gross;
  const hasTaxes = !isEmpty(shift.taxes);

  const rows: { label: string; value: string }[] = [
    { label: "Start", value: when(shift.startDate) },
    { label: "Finish", value: when(shift.endDate) },
    production
      ? {
          label: "Pieces",
          value: `${shift.itemQuantity ?? 0} × ${money(Number(shift.itemValue ?? 0))}`,
        }
      : {
          label: "Time worked",
          value: shift.amount ? `${ShiftService.convertAmountInDecimal(shift.amount)}h` : "–",
        },
    ...(!production ? [{ label: "Hourly rate", value: money(Number(shift.hourValue ?? 0)) }] : []),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <span
          className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", colors.soft, colors.ink)}
        >
          {production ? "Per piece" : "Hourly"}
        </span>
        {shift.isPublicHoliday ? (
          <span className="rounded-full bg-fast-soft px-2.5 py-1 text-xs font-semibold text-fast-ink">
            {shift.publicHolidayWorked ? "Public holiday, worked" : "Public holiday"}
          </span>
        ) : null}
      </div>

      <section className="flex flex-col gap-3 rounded-xl bg-surface-inverse p-4 text-ink-inverse">
        <div className="flex flex-col gap-1">
          <span className="text-[0.8125rem] text-ink-inverse/70">Earned</span>
          <span className="figure text-[2.5rem] leading-none text-live">{money(gross)}</span>
        </div>
        {hasTaxes ? (
          <div className="flex justify-between border-t border-ink-inverse/15 pt-3 text-sm font-semibold">
            <span>After taxes</span>
            <span className="tabular-nums">{money(net)}</span>
          </div>
        ) : null}
      </section>

      <dl className="divide-y divide-border rounded-2xl border border-border">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4 px-4 py-3">
            <dt className="text-sm text-ink-muted">{row.label}</dt>
            <dd className="text-right text-sm font-medium text-ink tabular-nums">{row.value}</dd>
          </div>
        ))}
      </dl>

      {hasTaxes ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-[0.8125rem] font-medium text-ink-muted">Taxes</h3>
          <ul className="flex flex-wrap gap-2">
            {shift.taxes?.map((tax) => (
              <li
                key={tax.id}
                className="rounded-full border border-border-strong px-3 py-1.5 text-sm"
              >
                {tax.name} <span className="text-ink-muted tabular-nums">{tax.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {shift.notes ? (
        <div className="flex flex-col gap-1.5">
          <h3 className="text-[0.8125rem] font-medium text-ink-muted">Notes</h3>
          <p className="rounded-xl bg-surface-sunken px-3.5 py-3 text-sm whitespace-pre-line text-ink">
            {shift.notes}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default TableDialogContent;
