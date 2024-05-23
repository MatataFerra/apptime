"use client";

import { useEffect, useMemo, useState } from "react";

import { TaxCodes } from "@/types";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/Dropdown";

import { TAX_CODES } from "@/utils/constants";

import { useShiftData } from "@/store/useShiftData";

/**
 *
 * @deprecated This component is deprecated and will be removed in the future.
 * The reason is the tax code will be included in Tax model.
 *
 */
function TaxCodeDropdown() {
  const { setData, setErrors, data } = useShiftData((state) => state);
  // @ts-ignore
  const [taxCode, setTaxCode] = useState(data.taxCode?.toString() ?? TAX_CODES.NONE.toString());
  const taxCodeSelected = useMemo(
    () =>
      Object.keys(TAX_CODES).find(
        (key) => TAX_CODES[key as keyof typeof TAX_CODES] === Number(taxCode)
      ),
    [taxCode]
  );

  useEffect(() => {
    if (taxCode.length === 0) setErrors(true);

    setErrors(false);
  }, [taxCode, setErrors]);

  function onChangeTaxCode(value: string) {
    setTaxCode(value);
    // @ts-ignore
    setData({ taxCode: value ? (Number(value) as TaxCodes) : 2 });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="h-9 w-full flex-shrink-[1] flex-grow-[2] basis-[120px] self-baseline px-2 py-1 text-xs shadow-input">
        Tax Code ({taxCodeSelected})
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        <DropdownMenuRadioGroup value={taxCode} onValueChange={onChangeTaxCode}>
          <DropdownMenuRadioItem value={TAX_CODES.M.toString()}>M</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value={TAX_CODES.CAE.toString()}>CAE</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value={TAX_CODES.NONE.toString()}>None</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default TaxCodeDropdown;
