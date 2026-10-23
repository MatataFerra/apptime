import { useTranslations } from "next-intl";

import Options from "@/components/structures/Home/Options";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

function MainOptions() {
  const t = useTranslations("home.sections");

  return (
    <Stack orientation="vertical" spacing={2.5} classes="w-full">
      <Text as="h2" variant="label" classes="px-1 text-ink-muted">
        {t("see_money")}
      </Text>
      <Options />
    </Stack>
  );
}

export default MainOptions;
