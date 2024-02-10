import { forwardRef, Ref } from "react";

import { InputProps } from "@/types/forms";

import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { INPUT_VARIANTS } from "@/utils/constants/tailwind";
import { cn } from "@/utils/helpers/styleMerger";

function InputMeasure(props: InputProps, ref: Ref<HTMLInputElement>) {
  const { classes, type, isError, measure, measurePlace, ...rest } = props;
  return (
    <>
      <Stack
        as="div"
        alignItems="center"
        classes={`${
          isError ? "border border-red-600 focus-within:ring-red-600" : "focus-within:ring-blue-600"
        } ${
          classes ? classes : ""
        } h-[69px] items-center rounded-md border border-gray-200 bg-white p-3 px-2 py-1 text-2xl shadow-input focus-within:border-transparent focus-within:outline-none focus-within:ring-2`}
      >
        <input
          id={rest.name}
          ref={ref}
          type={type}
          autoComplete="off"
          className={cn(
            INPUT_VARIANTS["plane"],
            "h-full rounded-lg outline-none ",
            measurePlace === "left" ? "order-2" : "order-1"
          )}
          {...rest}
        />
        <Text
          as="small"
          classes={`text-2xl ${measurePlace === "left" ? "order-1" : "order-2"}`}
          color="text-stone-400"
        >
          {measure}
        </Text>
      </Stack>
    </>
  );
}

export default forwardRef(InputMeasure);
