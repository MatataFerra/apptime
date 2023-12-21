import React, { ReactElement } from "react";

import { isArray } from "lodash";

import { CSSClassNames } from "@/types";
import { TAILWIND_COLOR } from "@/types/tailwind";

import { TEXT_VARIANTS } from "@/utils/constants/tailwind";
import { cm } from "@/utils/helpers/styleMerger";

type Variants = keyof typeof TEXT_VARIANTS;

export const TextDefaultAsType = "p" as const;
type As = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "small" | "label";
type ValidElement<Props = any> =
  | keyof Pick<HTMLElementTagNameMap, As>
  | ((props: Props) => ReactElement);
type TextOwnProps<E extends ValidElement> = {
  as?: E;
  classes?: CSSClassNames;
  variant?: Variants;
  color?: TAILWIND_COLOR;
  children: (string | ReactElement | boolean)[] | string | ReactElement | undefined;
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
  ...props
}: TextProps<E>): ReactElement {
  const Component = as || TextDefaultAsType;

  return (
    <Component
      className={cm(
        TEXT_VARIANTS[variant],
        classes,
        color,
        isArray(children) && "inline-flex gap-2"
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Text;
