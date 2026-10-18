"use client";

import { useState } from "react";

import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import { ButtonShadCn } from "@/components/ui/buttonShadcn";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/Command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";

import { cn } from "@/utils/helpers/styleMerger";

type Data = {
  label: string;
  value: string;
  id: string;
};

type Props = {
  data: Data[];
  staleTitle?: string;
  emptyTitle?: string;
  searchingTitle?: string;
  selected?: string;
  setSelected?: (value: string) => void;
};

function DropdownFlagSearchable({
  data,
  staleTitle = "Select item",
  emptyTitle = "No item found",
  searchingTitle = "Searching items...",
  setSelected,
}: Props) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ButtonShadCn
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-ink-muted"
        >
          {search ? data.find((item) => item?.value === search)?.label : `${staleTitle}`}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </ButtonShadCn>
      </PopoverTrigger>
      <PopoverContent className="h-40 w-fit p-0" side="bottom">
        <Command>
          <CommandInput placeholder={`${searchingTitle}`} className="h-9" />
          <CommandEmpty>{emptyTitle}</CommandEmpty>
          <CommandGroup>
            <CommandList>
              {data?.map((item) => (
                <CommandItem
                  key={item?.value}
                  value={item?.value}
                  onSelect={(currentValue) => {
                    setSearch(currentValue);
                    setOpen(false);
                    setSelected && setSelected(currentValue);
                  }}
                >
                  {item.label}
                  <CheckIcon
                    className={cn(
                      "ml-auto h-4 w-4",
                      search === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default DropdownFlagSearchable;
