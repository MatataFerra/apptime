import { ReactElement } from "react";

import { CSSClassNames } from "@/types";
import { TAILWIND_COLOR } from "@/types/tailwind";

import { GRADIENTS, TEXT_VARIANTS } from "@/utils/constants/tailwind";
import { cn } from "@/utils/helpers/styleMerger";

type Variants = keyof typeof TEXT_VARIANTS;
type Gradients = keyof typeof GRADIENTS;

export const TextDefaultAsType = "p" as const;
type As = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "small" | "label" | "th" | "td";
type ValidElement<Props = any> =
  | keyof Pick<HTMLElementTagNameMap, As>
  | ((props: Props) => ReactElement);
type TextOwnProps<E extends ValidElement> = {
  as?: E;
  classes?: CSSClassNames;
  variant?: Variants;
  color?: TAILWIND_COLOR;
  gradient?: Gradients;
  children: React.ReactNode;
};

type TextProps<E extends ValidElement> = TextOwnProps<E> &
  Omit<Omit<React.ComponentProps<E>, "className">, keyof TextOwnProps<E>>;

/**
 * @component Title
 * @param {string} title
 * @param {As} as - HTML heading element
 * @default "p"
 * @param {string} classes - HTML class attribute
 * if your using TailwindCSS and VSCode
 * you can add this line to your settings.json file:
 *
 * "tailwindCSS.classAttributes": ["class", "className", "ngClass", ".*Styles", "classes"]
 *
 * This will allow you to have intellisense for the TailwindCSS class attribute
 * @param {Variants} variants - TailwindCSS class variants
 * @default "default"
 */

function Text<E extends ValidElement = typeof TextDefaultAsType>({
  children,
  as,
  classes,
  variant = "default",
  color,
  gradient,
  ...props
}: TextProps<E>): ReactElement {
  const Component = as || TextDefaultAsType;

  return (
    <Component
      className={cn(
        TEXT_VARIANTS[variant],
        gradient ? `bg-gradient-to-r bg-clip-text text-transparent ${GRADIENTS[gradient]}` : "",
        classes,
        color
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Text;
