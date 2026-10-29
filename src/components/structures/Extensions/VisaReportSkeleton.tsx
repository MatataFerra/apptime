import Skeleton from "@/components/ui/Skeleton";

/** Same shape as VisaReport while it loads: visa options, period, summary card. */
function VisaReportSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="flex flex-col gap-2">
        <Skeleton classes="mx-1 h-3.5 w-16" />
        {[0, 1, 2].map((row) => (
          <Skeleton key={row} classes="h-16 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton classes="h-11 w-full rounded-xl" />
      <Skeleton classes="h-44 w-full rounded-2xl" />
    </div>
  );
}

export default VisaReportSkeleton;
