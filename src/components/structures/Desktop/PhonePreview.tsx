import { Package, Timer, Zap } from "lucide-react";

import { LogoMark } from "@/components/ui/Logo";

const BARS = [
  { h: 70, p: 0 },
  { h: 52, p: 24 },
  { h: 80, p: 0 },
  { h: 0, p: 46 },
  { h: 64, p: 0 },
  { h: 0, p: 0 },
  { h: 0, p: 0 },
];

/** A static picture of the Home screen inside a phone frame. Decorative. */
function PhonePreview() {
  return (
    <div aria-hidden="true" className="relative hidden justify-self-center lg:block">
      <div className="w-[310px] rotate-[3deg] rounded-[48px] bg-surface-inverse p-3 shadow-[0_40px_80px_-30px_rgb(20_33_28/0.55)]">
        <div className="flex h-[600px] flex-col gap-4 overflow-hidden rounded-[38px] bg-background px-4 pt-4">
          <div className="mx-auto h-6 w-24 rounded-full bg-surface-inverse" />

          <div className="flex items-center justify-between">
            <span className="flex size-8 flex-col justify-center gap-1">
              <span className="h-0.5 w-5 rounded-full bg-ink" />
              <span className="h-0.5 w-5 rounded-full bg-ink" />
              <span className="h-0.5 w-3.5 rounded-full bg-ink" />
            </span>
            <LogoMark className="size-6 text-ink" />
          </div>

          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-ink-muted">Sunday, October</span>
              <span className="display-title text-[3.25rem] leading-[0.85] text-ink">18</span>
            </div>
            <span className="mb-1 max-w-[7rem] text-right text-xs text-ink-muted">
              Hi Sam, this is week 42.
            </span>
          </div>

          <div className="flex items-center gap-2.5 rounded-2xl bg-track px-3 py-2.5 text-white">
            <span className="size-2 rounded-full bg-live" />
            <span className="flex flex-1 flex-col">
              <span className="text-[0.625rem] text-white/75">On the clock since 8:00 AM</span>
              <span className="figure text-lg leading-none">
                3<span className="text-[0.6em] text-white/60">h</span>24
                <span className="text-[0.6em] text-white/60">m</span>
              </span>
            </span>
            <span className="rounded-full bg-white/15 px-2.5 py-1 text-[0.625rem] font-semibold">
              Open
            </span>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl bg-surface-inverse p-3.5 text-ink-inverse">
            <span className="text-[0.625rem] text-ink-inverse/70">This week</span>
            <div className="grid grid-cols-3">
              <span className="figure text-xl leading-none text-live">$612</span>
              <span className="figure text-xl leading-none">26h</span>
              <span className="figure text-xl leading-none">5</span>
            </div>
            <div className="flex h-16 items-stretch gap-1.5">
              {BARS.map((bar, i) => (
                <span key={i} className="flex flex-1 flex-col justify-end gap-0.5">
                  {bar.p ? (
                    <span
                      className="rounded-sm bg-production-bright"
                      style={{ height: `${bar.p}%` }}
                    />
                  ) : null}
                  {bar.h ? (
                    <span className="rounded-sm bg-live" style={{ height: `${bar.h}%` }} />
                  ) : null}
                  {!bar.p && !bar.h ? <span className="h-1 rounded-sm bg-white/15" /> : null}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Timer, label: "Track", cls: "bg-track-soft text-track-ink" },
              { icon: Zap, label: "Fast charge", cls: "bg-fast-soft text-fast-ink" },
              { icon: Package, label: "Production", cls: "bg-production-soft text-production-ink" },
            ].map(({ icon: Icon, label, cls }) => (
              <span
                key={label}
                className={`flex h-20 flex-col justify-between rounded-xl p-2.5 ${cls}`}
              >
                <Icon className="size-4" strokeWidth={2} />
                <span className="text-[0.6875rem] leading-tight font-semibold">{label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhonePreview;
