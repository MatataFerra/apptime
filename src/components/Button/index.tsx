import { ReactElement } from "react";

import { CSSClassNames } from "@/types";

import { BUTTON_VARIANTS } from "@/utils/constants/tailwind";
import { cm } from "@/utils/helpers/styleMerger";

type Variants = keyof typeof BUTTON_VARIANTS;

interface Props
  extends Omit<
    React.HTMLAttributes<HTMLButtonElement | HTMLAnchorElement | HTMLDivElement>,
    "className"
  > {
  as?: "button" | "a" | "div";
  classes?: CSSClassNames;
  variant?: Variants;
  children?: (string | ReactElement)[] | string | ReactElement;
}

function Button({
  as = "button",
  classes,
  variant = "primary",
  children = "Send",
  ...props
}: Props): ReactElement {
  const Component = as;

  return (
    <Component
      className={cm(
        "w-40 cursor-pointer rounded-lg px-2 py-1 text-center",
        BUTTON_VARIANTS[variant],
        classes
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Button;
