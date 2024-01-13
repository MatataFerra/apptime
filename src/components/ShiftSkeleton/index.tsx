import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

function ShiftSkeleton() {
  return (
    <Stack orientation="vertical" classes="h-full w-full" spacing={8}>
      <Text as="h2" classes="flex gap-1 text-2xl">
        State: <Skeleton classes="h-8 w-16" />
      </Text>
      <Stack
        orientation="vertical"
        alignItems="center"
        classes="border_dash mt-2 min-h-[25dvh] w-full justify-center p-4"
        spacing={6}
        justifyContent="center"
      >
        <Skeleton classes="h-full w-full" />
      </Stack>
      <Stack
        orientation="vertical"
        classes="h-full w-full"
        alignItems="center"
        justifyContent="center"
      >
        <Skeleton classes="h-16 w-full" />
      </Stack>
    </Stack>
  );
}

export default ShiftSkeleton;
