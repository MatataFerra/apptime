import FastChargeForm from "@/components/FastChargeForm";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

export default async function FastCharge() {
  return (
    <Stack orientation="vertical" spacing={6}>
      <Stack orientation="vertical">
        <Text gradient="title" classes={`text-2xl font-bold`}>
          Fast charge
        </Text>
        <Text>charge a shift quickly</Text>
      </Stack>
      <FastChargeForm />
    </Stack>
  );
}
