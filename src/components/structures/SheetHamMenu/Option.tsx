"use client";

import { useRouter } from "next/navigation";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/Sheet";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

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
  const router = useRouter();

  return (
    <SheetClose asChild>
      <Stack
        key={option.id}
        data-testid={option.dataTestId}
        as="button"
        alignItems="center"
        classes="drawer-option"
        onClick={() => {
          router.push(option.url);
        }}
      >
        <Text classes="select-none font-medium">{option.label}</Text>
      </Stack>
    </SheetClose>
  );
}

export default Option;
