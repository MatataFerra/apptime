import { getTranslations } from "next-intl/server";

import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

export default async function DefaultHistory() {
  const t = await getTranslations("dashboard.history");

  return (
    <Stack
      orientation="vertical"
      classes="h-fit max-h-60 min-h-60 w-full overflow-y-scroll rounded-lg border border-border bg-surface"
    >
      <Text variant="error">{t("load_error")}</Text>
    </Stack>
  );
}
