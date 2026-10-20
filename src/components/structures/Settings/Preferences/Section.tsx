import type { ReactNode } from "react";

/** A titled group of settings rows. */
export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={title} className="flex w-full flex-col gap-2">
      <header className="flex flex-col gap-0.5 px-1">
        <h2 className="text-sm font-semibold text-ink-muted">{title}</h2>
        {description ? <p className="text-[0.8125rem] text-ink-subtle">{description}</p> : null}
      </header>
      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
        {children}
      </div>
    </section>
  );
}

/** One setting: label on the left, its control on the right or below. */
export function Row({
  label,
  hint,
  htmlFor,
  stacked,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  stacked?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={
        stacked
          ? "flex flex-col gap-3 px-4 py-3.5"
          : "flex min-h-14 items-center justify-between gap-4 px-4 py-3"
      }
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <label htmlFor={htmlFor} className="text-[0.9375rem] text-ink">
          {label}
        </label>
        {hint ? <p className="text-[0.8125rem] text-ink-muted">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}
