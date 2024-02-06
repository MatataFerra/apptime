import FastChargeForm from "@/components/FastChargeForm";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { GRADIENTS } from "@/utils/constants/tailwind";

export default async function FastCharge() {
  return (
    <Stack orientation="vertical" spacing={6}>
      <Stack orientation="vertical">
        <Text variant="gradient" classes={`text-2xl font-bold ${GRADIENTS.gradient_2}`}>
          Fast charge
        </Text>
        <Text>charge a shift quickly</Text>
      </Stack>
      <FastChargeForm />
    </Stack>
  );
}
