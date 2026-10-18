import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { GRADIENTS } from "@/utils/constants/tailwind";

type Props = {
  title: string;
  subtitle?: string;
  /** @deprecated ignored, kept for compatibility */
  gradient?: keyof typeof GRADIENTS;
};

function ModuleTitle({ title, subtitle }: Props) {
  return (
    <Stack orientation="vertical" spacing={1} classes="pt-2">
      <Text as="h1" variant="title">
        {title}
      </Text>
      {subtitle && (
        <Text variant="small" classes="first-letter:uppercase">
          {subtitle}
        </Text>
      )}
    </Stack>
  );
}

export default ModuleTitle;
