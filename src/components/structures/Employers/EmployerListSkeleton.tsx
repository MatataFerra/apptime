import Skeleton from "@/components/ui/Skeleton";

/**
 * Same shape as EmployerList while it loads: the add button, the section
 * header and a few employer rows (name, meta line, edit and remove).
 */
function EmployerListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <Skeleton classes="h-11 w-full" />
      <div className="flex w-full flex-col gap-2">
        <div className="flex flex-col gap-1.5 px-1">
          <Skeleton classes="h-3.5 w-28" />
          <Skeleton classes="h-3 w-52" />
        </div>
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="flex min-h-14 items-center gap-1 py-1 pr-3 pl-1">
              <div className="flex min-w-0 flex-1 flex-col gap-1.5 px-3 py-2">
                <Skeleton classes="h-4 w-36" />
                <Skeleton classes="h-3 w-48 max-w-full" />
              </div>
              {/* Edit and remove: icon-sized marks in the buttons' 40px boxes */}
              {[0, 1].map((icon) => (
                <div key={icon} className="flex size-10 shrink-0 items-center justify-center">
                  <Skeleton classes="size-4 rounded" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EmployerListSkeleton;
