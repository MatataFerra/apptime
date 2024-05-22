"use client";

import { useRouter } from "next/navigation";

import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { useDrawerStore } from "@/store/useDrawerStore";

type Option = {
  id: string;
  label: string;
  dataTestId: string;
  url: string;
};

type Props = {
  option: Option;
};

function Option({ option }: Props) {
  const toggle = useDrawerStore((state) => state.toggle);
  const router = useRouter();

  return (
    <Stack
      key={option.id}
      data-testid={option.dataTestId}
      as="button"
      alignItems="center"
      classes="drawer-option"
      onClick={() => {
        router.push(option.url);
        toggle();
      }}
    >
      <Text classes="select-none font-medium">{option.label}</Text>
    </Stack>
  );
}

export default Option;
