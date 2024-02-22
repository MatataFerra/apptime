import { CSSClassNames } from "@/types";

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

function TableElement<E extends ValidTableElement = typeof TableElementDefaultAsType>({
  classes,
  children,
  as,
  ...props
}: Props<E>) {
  const isTr = as === "tr";
  const Element = as || "td";
  const defaultStyles = !isTr ? "p-4 text-base text-gray-800 dark:text-gray-100" : "";
  const classesStyles = classes ? classes : "";
  const styles = !isTr ? `${defaultStyles} ${classesStyles}` : undefined;

  return (
    <Element className={styles ? cn(styles) : undefined} {...props}>
      {children}
    </Element>
  );
}

export default TableElement;
