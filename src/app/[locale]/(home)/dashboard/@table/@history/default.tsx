import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

export default async function DefaultHistory() {
  return (
    <Stack
      orientation="vertical"
      classes="h-fit max-h-60 min-h-60 w-full overflow-y-scroll rounded-lg border border-border bg-surface"
    >
      <Text variant="error">Error during loading</Text>
    </Stack>
  );
}
