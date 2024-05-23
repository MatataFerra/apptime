"use client";

import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { useCompareStore } from "@/store/useCompareStore";

function CompareForm() {
  const { setProduction, setHourly, hourly, production } = useCompareStore((state) => state);

  return (
    <Stack orientation="vertical">
      <Stack as="form" spacing={1} orientation="vertical">
        <Text variant="subtitle" classes="text-base underline">
          Production
        </Text>
        <Stack as="fieldset" classes="w-full">
          <Input
            type="number"
            name="itemValue"
            label="Item value"
            measure="$"
            measurePlace="left"
            value={production.itemValue}
            onChange={(e) => setProduction({ itemValue: e.target.value })}
          />
          <Input
            type="number"
            name="itemQuantity"
            label="Item quantity"
            value={production.itemQuantity}
            onChange={(e) => setProduction({ itemQuantity: e.target.value })}
          />
        </Stack>
      </Stack>
      <Stack as="form" spacing={1} orientation="vertical">
        <Text variant="subtitle" classes="text-base underline">
          Hourly
        </Text>
        <Stack as="fieldset" classes="w-full">
          <Input
            type="number"
            name="hourlyWage"
            label="Hourly wage"
            measure="$"
            measurePlace="left"
            value={hourly.hourlyWage}
            onChange={(e) => setHourly({ hourlyWage: e.target.value })}
          />
          <Input
            type="time"
            name="hoursWorked"
            label="Hours worked"
            measure="h."
            value={hourly?.hoursWorked}
            onChange={(e) => setHourly({ hoursWorked: e.target.value })}
          />
        </Stack>
      </Stack>
    </Stack>
  );
}

export default CompareForm;
