import { CSSClassNames } from "@/types";

import { cn } from "@/utils/helpers/styleMerger";

import {
  STACK_ALIGN,
  STACK_JUSTIFY,
  STACK_ORIENTATION,
} from "../../../utils/constants/tailwind/index";

export const StackDefaultAsType = "section" as const;

type StackOwnProps<E extends React.ElementType> = {
  children?: (string | React.ReactElement | boolean)[] | string | React.ReactElement | boolean;
  as?: E;
  classes?: CSSClassNames;
  orientation?: keyof typeof STACK_ORIENTATION;
  justifyContent?: keyof typeof STACK_JUSTIFY;
  alignItems?: keyof typeof STACK_ALIGN;
  spacing?: number;
  grid?: boolean;
};

type Props<E extends React.ElementType> = StackOwnProps<E> &
  Omit<Omit<React.ComponentProps<E>, "className">, keyof StackOwnProps<E>>;

async function Stack<E extends React.ElementType = typeof StackDefaultAsType>({
  as,
  classes,
  children,
  orientation = "horizontal",
  justifyContent = "start",
  alignItems = "start",
  spacing = 2,
  grid,
  ...props
}: Props<E>): Promise<React.ReactElement> {
  const Component = as || StackDefaultAsType;

  return (
    <>
      <Component
        className={cn(
          grid ? "grid" : STACK_ORIENTATION[orientation],
          STACK_JUSTIFY[justifyContent],
          STACK_ALIGN[alignItems],
          classes
        )}
        style={{ gap: `${spacing * 0.25}rem` }}
        {...props}
      >
        {children}
      </Component>
    </>
  );
}

export default Stack;
