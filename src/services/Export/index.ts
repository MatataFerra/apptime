import { format } from "date-fns";

import { historyEntries } from "@/services/History";

import type { HourlyType, ProductionType } from "@/types";

const COLUMNS = [
  "Type",
  "Job",
  "Start",
  "Finish",
  "Hours",
  "Hourly rate",
  "Pieces",
  "Value per piece",
  "Unpaid breaks (min)",
  "Public holiday",
  "Gross",
  "After taxes",
  "Currency",
  "Taxes",
  "Notes",
];

function cell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function at(date: string | null | undefined) {
  if (!date) return "";
  const d = new Date(date);
  return isNaN(d.valueOf()) ? "" : format(d, "yyyy-MM-dd HH:mm");
}

/** Every closed shift as CSV (oldest first), one row per shift. */
export function shiftsToCsv(
  hourly: HourlyType[] | undefined | null,
  production: ProductionType[] | undefined | null,
  defaultCurrency: string
) {
  const rows = historyEntries(hourly, production)
    .reverse()
    .map((entry) => {
      const shift = entry.shift as HourlyType & ProductionType;
      const isHourly = entry.kind === "hourly";
      return [
        isHourly ? "Per hour" : "Per piece",
        entry.name ?? "",
        at(shift.startDate),
        at(shift.endDate),
        (entry.minutes / 60).toFixed(2),
        isHourly ? shift.hourValue : "",
        isHourly ? "" : shift.itemQuantity,
        isHourly ? "" : shift.itemValue,
        isHourly ? (shift.unpaidBreaks ?? "") : "",
        entry.holiday === "worked" ? "Worked" : entry.holiday === "off" ? "Day off" : "",
        entry.earned.toFixed(2),
        entry.afterTaxes.toFixed(2),
        entry.currency ?? defaultCurrency,
        (shift.taxes ?? []).map((t) => `${t.name} ${t.value}%`).join("; "),
        shift.notes ?? "",
      ];
    });

  return [COLUMNS, ...rows].map((row) => row.map(cell).join(",")).join("\n");
}
