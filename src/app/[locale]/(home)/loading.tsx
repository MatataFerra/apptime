import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

export default function LoadingHome() {
  return (
    <>
      <Stack orientation="vertical" spacing={8}>
        <Skeleton classes="h-20 w-full" />
        <Skeleton classes="h-20 w-full" />
        <Skeleton classes="h-20 w-full" />
      </Stack>
    </>
  );
}
