import { forwardRef, type Ref } from "react";

import type { CSSClassNames } from "@/types";

import Button from "@/components/ui/Button";
import Text from "@/components/ui/Text";

import { cn } from "@/utils/helpers/styleMerger";

interface Props extends Omit<React.HTMLAttributes<HTMLButtonElement>, "className"> {
  classes?: CSSClassNames;
  text?: string;
  disabled?: boolean;
  icon?: JSX.Element;
}

function FloatingActionButton(
  { classes, text, icon, disabled, ...props }: Props,
  ref: Ref<HTMLButtonElement>
) {
  return (
    <Button
      ref={ref}
      as="button"
      type="button"
      variant="outlined"
      disabled={disabled}
      classes={cn(
        "flex size-20 flex-col items-center justify-center rounded-full border p-2",
        classes ? classes : ""
      )}
      {...props}
    >
      {icon ? icon : null}
      {text ? (
        <Text as="span" classes="text-base leading-tight text-current">
          {text}
        </Text>
      ) : null}
    </Button>
  );
}

export default forwardRef(FloatingActionButton);
