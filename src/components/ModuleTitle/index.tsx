import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

type Props = {
  title: string;
  subtitle: string;
};

function ModuleTitle({ title, subtitle }: Props) {
  return (
    <Stack orientation="vertical">
      <Text gradient="title" classes={`text-2xl font-bold`}>
        {title}
      </Text>
      <Text>{subtitle}</Text>
    </Stack>
  );
}

export default ModuleTitle;
