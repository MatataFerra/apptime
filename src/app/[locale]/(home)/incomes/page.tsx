import IncomesCalculator from "@/components/IcomesCalculator";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { GRADIENTS } from "@/utils/constants/tailwind";

export default async function FastCharge() {
  return (
    <Stack orientation="vertical" spacing={6}>
      <Stack orientation="vertical">
        <Text variant="gradient" classes={`text-2xl font-bold ${GRADIENTS.gradient_2}`}>
          Estimate your incomes
        </Text>
        <Text>take a look how much you can earn</Text>
      </Stack>
      <IncomesCalculator />
    </Stack>
  );
}
