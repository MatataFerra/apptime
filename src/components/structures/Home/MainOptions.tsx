import Options from "@/components/structures/Home/Options";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

function MainOptions() {
  return (
    <Stack orientation="vertical" spacing={2.5} classes="w-full">
      <Text as="h2" variant="label" classes="px-1 text-ink-muted">
        See your money
      </Text>
      <Options />
    </Stack>
  );
}

export default MainOptions;
