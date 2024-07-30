import Image from "@/components/ui/Image";
import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

export default function ScreenPage() {
  return (
    <Stack as="div" orientation="vertical" classes="h-full w-full">
      <Stack
        as="article"
        orientation="vertical"
        alignItems="start"
        classes="h-[50dvh] w-full bg-gradient-to-br from-white via-slate-100 to-slate-300 p-4 shadow-input transition-all"
        spacing={6}
        justifyContent="between"
      >
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
          <Image
            src="/assets/clock_non_shifts.webp"
            alt="Clock lay down shown when there is no shift open"
            width={150}
            height={150}
            classes="aspect-square size-auto"
            priority
          />

          <h1 className="text-2xl font-bold text-gray-800">No shift has started</h1>
        </div>
      </Stack>
    </Stack>
  );
}
