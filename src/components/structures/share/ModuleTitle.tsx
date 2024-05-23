import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { GRADIENTS } from "@/utils/constants/tailwind";

type Props = {
  title: string;
  subtitle?: string;
  gradient?: keyof typeof GRADIENTS;
};

function ModuleTitle({ title, subtitle, gradient = "title" }: Props) {
  return (
    <Stack orientation="vertical">
      <Text gradient={gradient} classes={`text-2xl font-bold`}>
        {title}
      </Text>
      {subtitle && <Text>{subtitle}</Text>}
    </Stack>
  );
}

export default ModuleTitle;
