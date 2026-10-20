"use client";

import { useMemo } from "react";

import { RotateCcw } from "lucide-react";

import { buttonVariants } from "@/components/ui/Button";

import { cn } from "@/utils/helpers/styleMerger";
import useMoney from "@/hooks/useMoney";

import { compareWages } from "./compareWages";
import { useCompareStore } from "@/store/useCompareStore";

const LEADS = {
  production: "Per piece pays more",
  hourly: "Per hour pays more",
  even: "Same money either way",
} as const;

function Bar({
  label,
  value,
  max,
  className,
}: {
  label: string;
  value: number;
  max: number;
  className: string;
}) {
  const money = useMoney();
  const width = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="tabular-nums">{money(value)}</span>
      </div>
      <div className="h-3 rounded-full bg-ink-inverse/10">
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", className)}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

/** Live result: who pays more, by how much, and pieces needed to match. */
function Report() {
  const money = useMoney();
  const { hourly, production, reset } = useCompareStore((state) => state);
  const result = useMemo(() => compareWages({ ...production, ...hourly }), [hourly, production]);
  const max = Math.max(result.production, result.hourly);

  return (
    <section
      aria-live="polite"
      className="flex w-full flex-col gap-4 rounded-3xl bg-surface-inverse p-5 text-ink-inverse"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-ink-inverse/70">
            {result.winner ? LEADS[result.winner] : "Fill in both sides to compare"}
          </span>
          <p
            className={cn(
              "figure text-[2.75rem] leading-none",
              result.winner === "production"
                ? "text-production-bright"
                : result.winner === "hourly"
                  ? "text-live"
                  : "text-ink-inverse/40"
            )}
          >
            {result.winner === "even"
              ? "Even"
              : result.winner
                ? `+${money(result.difference)}`
                : money(0)}
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          aria-label="Clear both sides"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "text-ink-inverse/70 hover:bg-ink-inverse/10 hover:text-ink-inverse"
          )}
        >
          <RotateCcw className="size-4.5" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        <Bar
          label="Per piece"
          value={result.production}
          max={max}
          className="bg-production-bright"
        />
        <Bar label="Per hour" value={result.hourly} max={max} className="bg-live" />
      </div>

      <p className="text-[0.8125rem] text-ink-inverse/70">
        {result.piecesToMatch !== null
          ? `You need ${result.piecesToMatch} pieces to match the hourly pay.`
          : "Add a price per piece and an hourly rate to see how many pieces match the hourly pay."}
      </p>
    </section>
  );
}

export default Report;
