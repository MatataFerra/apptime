import IncomesCalculator from "@/components/IcomesCalculator";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

export const dynamic = "force-static";

export default async function Incomes() {
  return (
    <Stack orientation="vertical" spacing={6}>
      <Stack orientation="vertical">
        <Text gradient="title" classes="text-2xl font-bold">
          Estimate your incomes
        </Text>
        <Text>take a look how much you can earn</Text>
      </Stack>
      <IncomesCalculator />
    </Stack>
  );
}
