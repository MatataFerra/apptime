import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

export default function DefaultPage() {
  return (
    <Stack as="div" orientation="vertical" classes="h-full w-full">
      <Stack
        as="article"
        orientation="vertical"
        alignItems="start"
        classes="h-full w-full bg-gradient-to-br from-white via-slate-100 to-slate-300 p-4 shadow-input"
        spacing={6}
        justifyContent="between"
      >
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
          <Skeleton classes="h-full w-full" />
        </div>
      </Stack>
      <Skeleton classes="h-16 w-full" />
    </Stack>
  );
}
