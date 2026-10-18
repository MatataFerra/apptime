import { forwardRef } from "react";

import type { CSSClassNames } from "@/types";

import { cn } from "@/utils/helpers/styleMerger";

export const TableElementDefaultAsType = "td" as const;

type As = "th" | "td" | "tr";

type ValidTableElement<Props = any> =
  | keyof Pick<HTMLElementTagNameMap, As>
  | ((props: Props) => React.ReactElement);

type TableElementOwnProps<E extends React.PropsWithChildren<ValidTableElement>> = {
  as?: E;
  classes?: CSSClassNames;
};

type Props<E extends ValidTableElement> = TableElementOwnProps<E> &
  Omit<Omit<React.ComponentProps<E>, "className">, keyof TableElementOwnProps<E>>;

function TableElement<E extends ValidTableElement = typeof TableElementDefaultAsType>(
  { classes, children, as, ...props }: Props<E>,
  ref: React.ForwardedRef<HTMLTableCellElement>
) {
  const isTr = as === "tr";
  const Element = as || "td";
  const defaultStyles = !isTr
    ? "p-4 text-xs text-ink group-hover:bg-surface-sunken"
    : "group cursor-pointer";
  const classesStyles = classes ? classes : "";

  return (
    <Element
      ref={ref}
      className={defaultStyles || classes ? cn(defaultStyles, classesStyles) : undefined}
      {...props}
    >
      {children}
    </Element>
  );
}

TableElement.displayName = "TableElement";

/**
 * Forward Ref table element
 * @param props - TableElement props
 * @param ref - TableElement ref
 * @returns TableElement component
 */
export default forwardRef(TableElement);
