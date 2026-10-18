import Features from "@/components/structures/Home/Features";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

function MainModules() {
  return (
    <Stack orientation="vertical" spacing={2} classes="w-full">
      <Text as="h2" variant="label" classes="px-1 text-ink-muted">
        Log work
      </Text>
      <Features />
    </Stack>
  );
}

export default MainModules;
