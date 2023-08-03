import { CSSClassNames } from "@/types";
import { BUTTON_VARIANTS } from "@/utils/constants";
import { cm } from "@/utils/helpers";
import { ReactElement } from "react";

type Variants = keyof typeof BUTTON_VARIANTS;

interface Props {
  as?: "button" | "a" | "div";
  classes?: CSSClassNames;
  variants?: Variants;
  children?: (string | ReactElement)[] | string | ReactElement;
}

function Button({
  as = "div",
  classes,
  variants = "primary",
  children = "Send",
}: Props): ReactElement {
  const Component = as;

  return (
    <Component
      className={cm(
        "w-40 py-1 px-2 text-center rounded-lg font-bold cursor-pointer",
        BUTTON_VARIANTS[variants],
        classes
      )}
    >
      {children}
    </Component>
  );
}

export default Button;
