"use client";

import { useMemo } from "react";

import dynamic from "next/dynamic";

import ShiftService from "@/services/Shift";

import Loader from "@/components/ui/Loader";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { useCompareStore } from "@/store/useCompareStore";

const Popover = dynamic(() => import("@/components/ui/Popover").then((mod) => mod.Popover), {
  ssr: false,
});
const PopoverContent = dynamic(
  () => import("@/components/ui/Popover").then((mod) => mod.PopoverContent),
  { ssr: false }
);
const PopoverTrigger = dynamic(
  () => import("@/components/ui/Popover").then((mod) => mod.PopoverTrigger),
  { ssr: false }
);

function Report() {
  const { hourly, production, isComparing, isLoading, setIsComparing } = useCompareStore(
    (state) => state
  );

  const hourToDecimal = useMemo(() => {
    if (!isComparing) return;
    const [hours, minutes] = hourly.hoursWorked.split(":");
    const getMinutes = Number(hours) * 60 + Number(minutes);
    const toDecimal = ShiftService.convertAmountInDecimal(getMinutes);
    return toDecimal;
  }, [hourly.hoursWorked, isComparing]);

  const compareWages = useMemo(() => {
    if (!isComparing) return;
    const productionWage = Number(production?.itemValue) * Number(production?.itemQuantity);
    const hourlyWage = Number(hourly.hourlyWage) * Number(hourToDecimal);

    if (!productionWage && !hourlyWage) setIsComparing(false);

    return {
      productionWage,
      hourlyWage,
      better: hourlyWage > productionWage,
      hasResult: productionWage && hourlyWage,
    };
  }, [
    hourToDecimal,
    hourly.hourlyWage,
    production?.itemQuantity,
    production?.itemValue,
    setIsComparing,
    isComparing,
  ]);

  return (
    <Stack
      orientation="vertical"
      spacing={2}
      classes="h-full min-h-10 w-full px-1 py-2 shadow-input transition-all"
    >
      {isComparing && compareWages?.hasResult ? (
        <Stack orientation="vertical" classes="h-full w-full animate-fade-in transition-all">
          <Text variant="subtitle" classes="text-base underline">
            Comparison result
          </Text>
          {isLoading ? (
            <Stack alignItems="center" justifyContent="center" classes="h-full w-full">
              <Loader.spinner />
            </Stack>
          ) : (
            <>
              <Text classes="text-sm">
                Production wage: ${compareWages.productionWage.toFixed(2)}
              </Text>
              <Text classes="text-sm">Hourly wage: ${compareWages.hourlyWage.toFixed(2)}</Text>

              <Popover>
                <PopoverTrigger className="w-full">
                  <Text
                    variant="subtitle"
                    gradient={compareWages.better ? "poison" : "ocean"}
                    classes="rounded-lg border border-slate-400 px-1  py-2 text-sm"
                  >
                    {compareWages.better ? "Hourly wage is better" : "Production wage is better"}
                  </Text>
                </PopoverTrigger>
                <PopoverContent>
                  {!compareWages.better ? (
                    <Text classes="text-xs">
                      You will earn{" "}
                      <Text as="span" color="text-ocean" classes="font-bold underline">
                        {`$${(compareWages.productionWage / Number(hourToDecimal)).toFixed(2)}`}{" "}
                      </Text>
                      <Text as="span" classes="underline">
                        per hour{" "}
                      </Text>
                      working same time if you choose the production wage
                    </Text>
                  ) : (
                    <Text classes="text-xs">
                      You will earn{" "}
                      <Text as="span" color="text-ocean" classes="font-bold underline">
                        {`$${(compareWages.hourlyWage - compareWages.productionWage).toFixed(2)}`}{" "}
                      </Text>
                      more than production wage
                    </Text>
                  )}
                </PopoverContent>
              </Popover>
            </>
          )}
        </Stack>
      ) : (
        <Text
          variant="subtitle"
          classes="animate-fade-in self-center justify-self-center text-center text-sm"
        >
          No comparison yet
        </Text>
      )}
    </Stack>
  );
}

export default Report;
