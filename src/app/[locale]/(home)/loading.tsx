import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

export default function LoadingHome() {
  return (
    <>
      <Stack classes="h-full w-full" orientation="vertical" spacing={4}>
        <Skeleton classes="h-full w-full" />
        <Skeleton classes="h-full w-full" />
        <Skeleton classes="h-full w-full" />
      </Stack>
    </>
  );
}
