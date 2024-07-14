import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

function Title() {
  return (
    <Stack as="article" classes="w-full" alignItems="center">
      <div className="mt-2 animate-bounce fill-mode-forwards repeat-1">📢</div>
      <Text
        variant="small"
        classes="animate-pulse text-pretty text-xs fill-mode-backwards repeat-1"
      >
        Most used taxes
      </Text>
    </Stack>
  );
}

export default Title;
