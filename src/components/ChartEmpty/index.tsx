import { PropsWithChildren } from "react";

import { isEmpty } from "lodash";

import { CarouselItem } from "@/components/ui/Carousel";
import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

interface Props extends PropsWithChildren<{}> {
  data: unknown[];
}

function ChartEmpty({ data, children }: Props) {
  return (
    <>
      {isEmpty(data) ? (
        <CarouselItem>
          <Stack
            grid
            classes="h-80 w-full place-content-center rounded-lg border border-gray-200 p-4 shadow-input"
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
