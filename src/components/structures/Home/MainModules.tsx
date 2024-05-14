import Features from "@/components/structures/Home/Features";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

function MainModules() {
  return (
    <Stack orientation="vertical">
      <Text variant="subtitle" classes="text-center text-lg">
        Main modules
      </Text>
      <Features />
    </Stack>
  );
}

export default MainModules;
