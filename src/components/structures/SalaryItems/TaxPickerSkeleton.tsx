import { CONTRIBUTION_PRESETS } from "@/services/Contribution/presets";

import Skeleton from "@/components/ui/Skeleton";

import { cn } from "@/utils/helpers/styleMerger";

const PRESET_WIDTHS = ["w-48", "w-56", "w-52", "w-64", "w-52", "w-48"];

/** "Saved" chips while the user's taxes load: the title row and a couple of pills. */
export function SavedChipsSkeleton() {
  return (
    <div className="flex flex-col gap-2.5" aria-hidden="true">
      <div className="flex items-center justify-between">
        <Skeleton classes="h-3.5 w-24 rounded" />
        <Skeleton classes="h-3 w-28 rounded" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Skeleton classes="h-10 w-28 rounded-full" />
        <Skeleton classes="h-10 w-24 rounded-full" />
        <Skeleton classes="h-10 w-20 rounded-full" />
      </div>
    </div>
  );
}

/**
 * The picker's shape while its code loads: same card, header, chips and
 * "New" button, so the form doesn't jump when it arrives. Contributions
 * also keep room for their presets.
 */
function TaxPickerSkeleton({
  kind = "taxes",
  bare = false,
}: {
  kind?: "taxes" | "contributions";
  bare?: boolean;
}) {
  return (
    <div
      aria-busy="true"
      className={cn(
        "flex w-full flex-col gap-4",
        !bare && "rounded-xl border border-border bg-surface p-4"
      )}
    >
      <div className="flex items-start gap-3">
        <Skeleton classes="size-9 shrink-0 rounded-[10px]" />
        <div className="flex flex-1 flex-col gap-1.5 pt-0.5">
          <Skeleton classes="h-4 w-28 rounded" />
          {/* The subtitle runs to two lines on a phone. */}
          <Skeleton classes="h-3.5 w-full rounded" />
          <Skeleton classes="h-3.5 w-1/2 rounded" />
        </div>
      </div>
      <SavedChipsSkeleton />
      {kind === "contributions" ? (
        <div className="flex flex-col gap-2.5" aria-hidden="true">
          <Skeleton classes="h-3.5 w-32 rounded" />
          {/* One row per preset: their names are long, so each takes a line. */}
          <div className="flex flex-col items-start gap-2">
            {CONTRIBUTION_PRESETS.map((preset, i) => (
              <Skeleton
                key={preset.id}
                classes={cn("h-10 rounded-full", PRESET_WIDTHS[i % PRESET_WIDTHS.length])}
              />
            ))}
          </div>
        </div>
      ) : null}
      <Skeleton classes="h-11 w-full rounded-md" />
    </div>
  );
}

export default TaxPickerSkeleton;
