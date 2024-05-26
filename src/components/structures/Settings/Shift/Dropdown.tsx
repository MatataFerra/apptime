"use client";

import { CaretSortIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/Dropdown";
import Text from "@/components/ui/Text";

import { WEEK_DAYS } from "@/utils/constants";
import useSettings from "@/hooks/useSettings";

function Dropdown() {
  const { setValue, values } = useSettings();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div>
          <Button
            variant="ghost"
            className="w-full justify-between text-sm capitalize text-stone-600"
          >
            <Text as="span" classes="line-clamp-1 text-xs">
              {!!values.configs.weekStartsOn ? `${values.configs.weekStartsOn}` : "Select day"}
            </Text>
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom">
        <DropdownMenuRadioGroup
          value={values.configs.weekStartsOn}
          onValueChange={(val) => {
            setValue({
              configs: {
                ...values.configs,
                weekStartsOn: val,
              },
            });
          }}
        >
          {WEEK_DAYS.map((day) => (
            <DropdownMenuRadioItem key={day} value={day} className="capitalize">
              {day}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Dropdown;
