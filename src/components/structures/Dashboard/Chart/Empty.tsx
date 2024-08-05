import type { PropsWithChildren } from "react";

import type { Hourly, Production, Shift } from "@prisma/client";
import isEmpty from "lodash/isEmpty";

import { CarouselItem } from "@/components/ui/Carousel";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

type Shifts =
  | (Shift & {
      hourly: Hourly[];
      production: Production[];
    })
  | null
  | undefined;

interface Props {
  data: Shifts;
}

function ChartEmpty({ data, children }: PropsWithChildren<Props>) {
  return (
    <>
      {isEmpty(data?.hourly) && isEmpty(data?.production) ? (
        <CarouselItem>
          <Stack
            justifyContent="center"
            alignItems="center"
            classes="flex h-72 w-full rounded-lg border border-gray-200 p-4 shadow-input"
          >
            <Text>No data</Text>
          </Stack>
        </CarouselItem>
      ) : (
        children
      )}
    </>
  );
}

export default ChartEmpty;
