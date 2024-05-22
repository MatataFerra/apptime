"use client";

import InputForm from "@/components/structures/Settings/InputForm";
import Dropdown from "@/components/structures/Settings/Shift/Dropdown";
import Stack from "@/components/ui/Stack";

import { useSettingsStore } from "@/store/useSettingsStore";

function Inputs() {
  const { values } = useSettingsStore((state) => state);

  return (
    <Stack as="div" orientation="vertical" classes="w-full" spacing={0}>
      <InputForm id="week" label="Week starts on" fallbackData={values.configs.weekStartsOn}>
        <Dropdown />
      </InputForm>
    </Stack>
  );
}

export default Inputs;
