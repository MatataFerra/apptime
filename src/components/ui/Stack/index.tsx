import { CSSClassNames } from "@/types";

import { cm, cn } from "@/utils/helpers/styleMerger";

import { STACK_ORIENTATION } from "../../../utils/constants/tailwind/index";

export const StackDefaultAsType = "section" as const;

type StackOwnProps<E extends React.ElementType> = {
  children?: (string | React.ReactElement)[] | string | React.ReactElement;
  as?: E;
  classes?: CSSClassNames;
  orientation?: keyof typeof STACK_ORIENTATION;
  spacing?: number;
};

type Props<E extends React.ElementType> = StackOwnProps<E> &
  Omit<Omit<React.ComponentProps<E>, "className">, keyof StackOwnProps<E>>;

async function Stack<E extends React.ElementType = typeof StackDefaultAsType>({
  as,
  classes,
  children,
  orientation = "horizontal",
  spacing = 2,
  ...props
}: Props<E>): Promise<React.ReactElement> {
  const Component = as || StackDefaultAsType;

  return (
    <>
      <Component
        className={cn(classes, STACK_ORIENTATION[orientation])}
        style={{ gap: `${spacing * 0.25}rem` }}
        {...props}
      >
        {children}
      </Component>
    </>
  );
}

export default Stack;
