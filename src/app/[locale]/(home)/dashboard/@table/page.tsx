import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { PickupDate } from "./lazy";

export default async function Table() {
  return (
    <Stack orientation="horizontal" alignItems="center" justifyContent="between" classes="w-full">
      <Text as="h2" classes="line-clamp-1 px-1 text-[0.9375rem] font-semibold">
        History
      </Text>
      <PickupDate />
    </Stack>
  );
}
