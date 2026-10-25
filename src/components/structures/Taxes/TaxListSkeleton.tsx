import Skeleton from "@/components/ui/Skeleton";

/** One saved item while loading: name and rate, the note line, edit and remove. */
function RowSkeleton({ name }: { name: string }) {
  return (
    <div className="flex min-h-14 items-center gap-3 px-4 py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-2 py-0.5">
        <span className="flex items-center gap-2">
          <Skeleton classes={`h-5 rounded ${name}`} />
          <Skeleton classes="h-5 w-10 rounded" />
        </span>
        <Skeleton classes="h-4 w-36 rounded" />
      </div>
      {/* The edit and remove buttons are bare icons. */}
      <span className="flex size-10 shrink-0 items-center justify-center">
        <Skeleton classes="size-4 rounded" />
      </span>
      <span className="flex size-10 shrink-0 items-center justify-center">
        <Skeleton classes="size-4 rounded" />
      </span>
    </div>
  );
}

function SectionSkeleton({ rows, lines = 1 }: { rows: string[]; lines?: 1 | 2 }) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-col gap-1.5 px-1">
        <Skeleton classes="h-4 w-32 rounded" />
        <Skeleton classes="h-3.5 w-64 max-w-full rounded" />
        {lines === 2 ? <Skeleton classes="h-3.5 w-40 rounded" /> : null}
      </div>
      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
        {rows.map((name, i) => (
          <RowSkeleton key={i} name={name} />
        ))}
      </div>
    </div>
  );
}

/**
 * The taxes page while it loads: the two sections ("My taxes", "My
 * contributions") with a few rows each, laid out like the real list so
 * nothing jumps when it arrives.
 */
function TaxListSkeleton() {
  return (
    <div aria-busy="true" className="contents">
      <SectionSkeleton rows={["w-28", "w-20"]} />
      {/* Its description runs to two lines on a phone. */}
      <SectionSkeleton rows={["w-32"]} lines={2} />
    </div>
  );
}

export default TaxListSkeleton;
