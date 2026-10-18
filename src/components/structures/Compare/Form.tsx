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
        <Text variant="subtitle" classes="text-base">
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
        <Text variant="subtitle" classes="text-base">
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
        </Stack>
        <Stack as="fieldset" classes="w-full">
          <Input
            type="number"
            inputMode="numeric"
            name="hoursWorked"
            label="Hours worked"
            measure="h"
            min={0}
            value={hourly?.hoursWorked}
            onChange={(e) => setHourly({ hoursWorked: e.target.value })}
          />
          <Input
            type="number"
            inputMode="numeric"
            name="minutesWorked"
            label="Minutes"
            measure="min"
            min={0}
            max={59}
            value={hourly?.minutesWorked ?? ""}
            onChange={(e) => setHourly({ minutesWorked: e.target.value })}
          />
        </Stack>
      </Stack>
    </Stack>
  );
}

export default CompareForm;
