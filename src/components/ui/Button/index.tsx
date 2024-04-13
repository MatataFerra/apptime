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
  size?: "sm" | "md" | "lg";
};
type Variants = keyof typeof BUTTON_VARIANTS;

type Props<E extends React.ElementType> = ButtonOwnProps<E> &
  Omit<Omit<React.ComponentProps<E>, "className">, keyof ButtonOwnProps<E>>;

function Button<E extends React.ElementType = typeof ButtonDefaultAsType>(
  props: Props<E>
): ReactElement {
  const { as, classes, variant = "primary", children, size = "lg", ...rest } = props;
  const Component = as || ButtonDefaultAsType;

  const SIZE = {
    sm: "w-20 h-8 p-1 text-sm",
    md: "w-28 h-10 p-2 text-base",
    lg: "w-40 h-12 p-3",
  };

  return (
    <Component
      className={cn(
        "w-40 cursor-pointer rounded-lg text-center",
        props.disabled ? BUTTON_VARIANTS["disabled"] : BUTTON_VARIANTS[variant],
        SIZE[size],
        classes?.trim()
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

export default Button;
