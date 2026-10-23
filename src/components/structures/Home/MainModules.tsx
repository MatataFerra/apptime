import { useTranslations } from "next-intl";

import Features from "@/components/structures/Home/Features";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

function MainModules() {
  const t = useTranslations("home.sections");

  return (
    <Stack orientation="vertical" spacing={2.5} classes="w-full">
      <Text as="h2" variant="label" classes="px-1 text-ink-muted">
        {t("log_work")}
      </Text>
      <Features />
    </Stack>
  );
}

export default MainModules;
