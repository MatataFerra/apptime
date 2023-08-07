import { CSSClassNames } from "@/types";
import { TEXT_VARIANTS } from "@/utils/constants";
import { cm } from "@/utils/helpers";
import _ from "lodash";
import React, { ReactElement } from "react";

type As = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
type Variants = keyof typeof TEXT_VARIANTS;

interface Props {
  as?: As;
  classes?: CSSClassNames;
  variants?: Variants;
  children: (string | ReactElement)[] | string | ReactElement;
}

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

function Text({
  children,
  as = "p",
  classes,
  variants = "default",
  ...props
}: Props): ReactElement {
  const Component = as;

  return (
    <Component
      className={cm(TEXT_VARIANTS[variants], classes, _.isArray(children) && "inline-flex gap-2")}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Text;
