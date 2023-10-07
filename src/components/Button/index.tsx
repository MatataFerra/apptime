import { ReactElement } from "react";

import { CSSClassNames } from "@/types";

import { BUTTON_VARIANTS } from "@/utils/constants/tailwind";
import { cm } from "@/utils/helpers/styleMerger";

export const ButtonDefaultAsType = "button" as const;

type ButtonOwnProps<E extends React.ElementType> = {
  children?: (string | ReactElement)[] | string | ReactElement;
  as?: E;
  classes?: CSSClassNames;
  variant?: Variants;
};
type Variants = keyof typeof BUTTON_VARIANTS;

type Props<E extends React.ElementType> = ButtonOwnProps<E> &
  Omit<Omit<React.ComponentProps<E>, "className">, keyof ButtonOwnProps<E>>;

function Button<E extends React.ElementType = typeof ButtonDefaultAsType>({
  as,
  classes,
  variant = "primary",
  children = "Send",
  ...props
}: Props<E>): ReactElement {
  const Component = as || ButtonDefaultAsType;

  return (
    <Component
      className={cm(
        "w-40 cursor-pointer rounded-lg text-center",
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
