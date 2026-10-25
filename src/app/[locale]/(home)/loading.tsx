import Skeleton from "@/components/ui/Skeleton";

/**
 * Shown while a module's page loads. Same outline as a module (header
 * band, then cards) instead of a centred spinner, so the header stays put
 * and the switch reads as the page filling in.
 */
export default function LoadingHome() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <div className="-mx-4 flex items-start gap-3.5 bg-(--band) px-5 pt-2 pb-6">
        <Skeleton classes="size-13 shrink-0 rounded-2xl" />
        <div className="flex flex-1 flex-col gap-2.5 pt-1">
          <Skeleton classes="h-9 w-3/5" />
          <Skeleton classes="h-4 w-4/5" />
        </div>
      </div>
      <Skeleton classes="h-36 w-full rounded-2xl" />
      <Skeleton classes="h-24 w-full rounded-2xl" />
      <Skeleton classes="h-24 w-full rounded-2xl" />
    </div>
  );
}
