import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";

export default async function Loading() {
  return (
    <Stack classes="h-fit w-full" spacing={10} alignItems="center" justifyContent="between">
      <Skeleton classes="h-12 w-full" />
      <Skeleton classes="h-12 w-full" />
    </Stack>
  );
}
