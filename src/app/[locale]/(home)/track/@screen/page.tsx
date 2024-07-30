import Image from "@/components/ui/Image";
import Stack from "@/components/ui/Stack";

export const maxDuration = 15;

export default async function ScreenPage() {
  return (
    <Stack
      as="article"
      orientation="vertical"
      alignItems="start"
      classes="h-monitor w-full bg-gradient-to-br from-white via-slate-100 to-slate-300 p-4 shadow-input transition-all"
      spacing={6}
      justifyContent="between"
    >
      <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
        {/* <Image
          src="/assets/clock_non_shifts.webp"
          alt="Clock lay down shown when there is no shift open"
          width={150}
          height={150}
          classes="aspect-square size-auto"
          priority
          
        /> */}

        <h1 className="text-2xl font-bold text-gray-800">No shift has started</h1>
      </div>
    </Stack>
  );
}
