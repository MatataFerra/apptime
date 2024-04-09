import { ReactElement, ReactNode } from "react";

import { CSSClassNames } from "@/types";

import { BUTTON_VARIANTS } from "@/utils/constants/tailwind";
import { cn } from "@/utils/helpers/styleMerger";

export const ButtonDefaultAsType = "button" as const;

type ButtonOwnProps<E extends React.ElementType> = {
  children?: ReactNode;
  as?: E;
  classes?: CSSClassNames;
  variant?: Variants;
};
type Variants = keyof typeof BUTTON_VARIANTS;

type Props<E extends React.ElementType> = ButtonOwnProps<E> &
  Omit<Omit<React.ComponentProps<E>, "className">, keyof ButtonOwnProps<E>>;

function Button<E extends React.ElementType = typeof ButtonDefaultAsType>(
  props: Props<E>
): ReactElement {
  const { as, classes, variant = "primary", children, ...rest } = props;
  const Component = as || ButtonDefaultAsType;

  return (
    <Component
      className={cn(
        "w-40 cursor-pointer rounded-lg text-center",
        props.disabled ? BUTTON_VARIANTS["disabled"] : BUTTON_VARIANTS[variant],
        classes?.trim()
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

export default Button;
