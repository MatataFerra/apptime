import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";

const Tracker = dynamic(() => import("@/components/modules/Track/Monitor/Tracker"), {
  ssr: false,
  loading: () => (
    <div className="flex size-full flex-col justify-between gap-6">
      <Skeleton classes="h-5 w-28 bg-ink-inverse/10" />
      <Skeleton classes="h-20 w-48 bg-ink-inverse/10" />
      <Skeleton classes="h-12 w-full bg-ink-inverse/10" />
    </div>
  ),
});

/**
 * The tracker monitor: the one dark, high-contrast surface in the app.
 */
async function Screen() {
  return (
    <article className="relative flex min-h-80 w-full flex-col justify-between gap-6 overflow-hidden rounded-3xl bg-surface-inverse px-5 pt-5.5 pb-4.5 text-ink-inverse">
      <Tracker />
    </article>
  );
}

export default Screen;
