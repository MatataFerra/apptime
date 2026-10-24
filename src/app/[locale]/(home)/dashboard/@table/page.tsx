import { getTranslations } from "next-intl/server";

import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { PickupDate } from "./lazy";

export default async function Table() {
  const t = await getTranslations("dashboard.history");

  return (
    <Stack orientation="horizontal" alignItems="center" justifyContent="between" classes="w-full">
      <Text as="h2" classes="line-clamp-1 text-[0.9375rem] font-semibold">
        {t("title")}
      </Text>
      <PickupDate />
    </Stack>
  );
}
