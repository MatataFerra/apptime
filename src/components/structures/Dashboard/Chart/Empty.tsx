import type { PropsWithChildren } from "react";

import isEmpty from "lodash/isEmpty";

import type { HourlyType, ProductionType } from "@/types";

import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

interface Props {
  data: (HourlyType | ProductionType)[] | null;
}

function ChartEmpty({ data, children }: PropsWithChildren<Props>) {
  return (
    <>
      {isEmpty(data) ? (
        <Stack
          justifyContent="center"
          alignItems="center"
          classes="flex h-72 w-full rounded-lg border border-gray-200 p-4 shadow-input"
        >
          <Text>No data</Text>
        </Stack>
      ) : (
        children
      )}
    </>
  );
}

export default ChartEmpty;
