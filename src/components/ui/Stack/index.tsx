import { CSSClassNames } from "@/types";

import { STACK_ALIGN, STACK_JUSTIFY, STACK_ORIENTATION } from "@/utils/constants/tailwind";
import { gridTemplate } from "@/utils/helpers/gridCreator";
import { cn } from "@/utils/helpers/styleMerger";

export const StackDefaultAsType = "section" as const;

type StackOwnProps<E extends React.ElementType> = {
  children?:
    | (string | boolean | React.ReactElement | React.ReactNode)[]
    | string
    | boolean
    | React.ReactElement
    | React.ReactNode;
  as?: E;
  classes?: CSSClassNames;
  orientation?: keyof typeof STACK_ORIENTATION;
  justifyContent?: keyof typeof STACK_JUSTIFY;
  alignItems?: keyof typeof STACK_ALIGN;
  spacing?: number;
  grid?: boolean;
  cols?: number | string;
  rows?: number | string;
  wrap?: boolean;
};

type Props<E extends React.ElementType> = StackOwnProps<E> &
  Omit<Omit<React.ComponentProps<E>, "className">, keyof StackOwnProps<E>>;

/**
 * @description Stack component
 * @param {React.ReactElement} children
 * @param {React.ElementType} as - HTML tag
 * @param {CSSClassNames} classes - Tailwind classes
 * @param {keyof typeof STACK_ORIENTATION} orientation - horizontal | vertical
 * @param {keyof typeof STACK_JUSTIFY} justifyContent - start | end | center | between
 * @param {keyof typeof STACK_ALIGN} alignItems - start | end | center
 * @param {number} spacing - use tailwing gap class
 * @param {boolean} grid - if is true, then you can use cols and rows props
 * @param {number | string} cols - use it as number or string e.g.: "1fr" or "auto 1fr auto"
 * @param {number | string} rows - use it as number or string e.g.: "1fr" or "auto 1fr auto"
 * @returns {React.ReactElement}
 */
function Stack<E extends React.ElementType = typeof StackDefaultAsType>({
  as,
  classes,
  children,
  orientation = "horizontal",
  justifyContent = "start",
  alignItems = "start",
  spacing = 2,
  grid,
  cols,
  rows,
  wrap,
  ...props
}: Props<E>): React.ReactElement {
  const Component = as || StackDefaultAsType;

  return (
    <>
      <Component
        className={cn(
          grid ? "grid" : STACK_ORIENTATION[orientation],
          !grid && STACK_JUSTIFY[justifyContent],
          !grid && STACK_ALIGN[alignItems],
          wrap && "flex-wrap",
          classes
        )}
        style={{
          gap: `${spacing * 0.25}rem`,
          gridTemplateColumns: gridTemplate(cols),
          gridTemplateRows: gridTemplate(rows),
        }}
        {...props}
      >
        {children}
      </Component>
    </>
  );
}

export default Stack;
