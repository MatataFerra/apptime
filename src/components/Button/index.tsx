import { ReactElement } from "react";

import { CSSClassNames } from "@/types";

import { BUTTON_VARIANTS } from "@/utils/constants";
import { cm } from "@/utils/helpers";

type Variants = keyof typeof BUTTON_VARIANTS;

interface Props
  extends React.HTMLAttributes<HTMLButtonElement | HTMLAnchorElement | HTMLDivElement> {
  as?: "button" | "a" | "div";
  classes?: CSSClassNames;
  variants?: Variants;
  children?: (string | ReactElement)[] | string | ReactElement;
}

function Button({
  as = "button",
  classes,
  variants = "primary",
  children = "Send",
  ...props
}: Props): ReactElement {
  const Component = as;

  return (
    <Component
      className={cm(
        "w-40 cursor-pointer rounded-lg px-2 py-1 text-center font-bold",
        BUTTON_VARIANTS[variants],
        classes
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Button;
