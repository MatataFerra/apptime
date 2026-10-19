"use client";

import { forwardRef } from "react";

import { format } from "date-fns";
import { Package, Timer } from "lucide-react";
import dynamic from "next/dynamic";

import Pay from "@/services/Pay";
import { formatHours, formatMoney, shiftMinutes } from "@/services/Summary";
import { type AnyShift, isPieceShift } from "@/services/Summary/history";

import TableDialog from "@/components/structures/Dashboard/Table/Dialog/Dialog";
import Skeleton from "@/components/ui/Skeleton";

import { MODULE_THEMES } from "@/utils/constants/modules";
import { cn } from "@/utils/helpers/styleMerger";

import { useDashHourlyStore } from "@/store/useDashHourlyStore";
import { useDashProductionStore } from "@/store/useDashProductionStore";

const DialogContent = dynamic(
  () => import("@/components/structures/Dashboard/Table/Dialog/Content"),
  { ssr: false, loading: () => <Skeleton classes="h-20 w-full" /> }
);

/** "1:38–9:08 PM", or "11:30 AM–7:00 PM" when the halves of the day differ. */
function timeRange(start?: string | null, end?: string | null) {
  const a = start ? new Date(start) : null;
  const b = end ? new Date(end) : null;
  if (!a || !b || isNaN(a.valueOf()) || isNaN(b.valueOf())) return "";
  return format(a, "a") === format(b, "a")
    ? `${format(a, "h:mm")}–${format(b, "h:mm a")}`
    : `${format(a, "h:mm a")}–${format(b, "h:mm a")}`;
}

/** One line per shift: when, what, how long, and what it paid. */
const RowButton = forwardRef<
  HTMLButtonElement,
  { shift: AnyShift } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(function RowButton({ shift, className, ...props }, ref) {
  const piece = isPieceShift(shift);
  const colors = MODULE_THEMES[piece ? "production" : "track"];
  const Icon = piece ? Package : Timer;
  const start = new Date(shift.startDate);
  const pay = new Pay(shift);
  const gross = pay.gross() ?? 0;
  const net = pay.netPay() ?? gross;
  const taxed = (shift.taxes?.length ?? 0) > 0 && net < gross;

  const detail = piece
    ? `${shift.itemQuantity ?? 0} pieces × ${formatMoney(shift.itemValue ?? 0)}`
    : `${timeRange(shift.startDate, shift.endDate)} · ${formatHours(shiftMinutes(shift))}`;

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-sunken focus-visible:bg-surface-sunken",
        className
      )}
      {...props}
    >
      <span className="flex w-10 shrink-0 flex-col items-center leading-none">
        <span className="figure text-[1.375rem] text-ink">{format(start, "d")}</span>
        <span className="mt-1 text-[0.6875rem] font-medium tracking-wide text-ink-muted uppercase">
          {format(start, "EEE")}
        </span>
      </span>

      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-[10px]",
          colors.soft,
          colors.ink
        )}
        aria-hidden="true"
      >
        <Icon className="size-4.5" strokeWidth={2} />
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[0.9375rem] font-medium text-ink">
            {shift.name || (piece ? "Per piece shift" : "Hourly shift")}
          </span>
          {shift.isPublicHoliday ? (
            <span className="shrink-0 rounded-full bg-fast-soft px-1.5 py-px text-[0.6875rem] font-semibold text-fast-ink">
              {shift.publicHolidayWorked ? "Holiday 1.5×" : "Holiday"}
            </span>
          ) : null}
        </span>
        <span className="truncate text-[0.8125rem] text-ink-muted tabular-nums">{detail}</span>
      </span>

      <span className="flex shrink-0 flex-col items-end gap-0.5">
        <span className="figure text-[1.0625rem] text-ink">{formatMoney(gross)}</span>
        {taxed ? (
          <span className="text-[0.75rem] text-ink-muted tabular-nums">{formatMoney(net)} net</span>
        ) : null}
      </span>
    </button>
  );
});

function HistoryRow({ shift }: { shift: AnyShift }) {
  const piece = isPieceShift(shift);
  const hourlyStore = useDashHourlyStore();
  const productionStore = useDashProductionStore();
  const store = piece ? productionStore : hourlyStore;

  return (
    <TableDialog
      title={piece ? "Per piece shift" : "Hourly shift"}
      shift={shift}
      type={piece ? "production" : "hourly"}
      delete={store.delete}
      reset={store.reset}
      content={<DialogContent shift={shift} />}
    >
      <RowButton shift={shift} />
    </TableDialog>
  );
}

export default HistoryRow;
