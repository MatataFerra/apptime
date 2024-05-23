import Options from "@/components/structures/Home/Options";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

function MainOptions() {
  return (
    <Stack orientation="vertical" classes="w-full">
      <Text classes="text-center text-xs">Shortcuts</Text>
      <Options />
    </Stack>
  );
}

export default MainOptions;
