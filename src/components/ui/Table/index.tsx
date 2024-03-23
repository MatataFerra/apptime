import { CSSClassNames } from "@/types";

import { cn } from "@/utils/helpers/styleMerger";

interface Props
  extends Omit<React.PropsWithChildren<React.TableHTMLAttributes<HTMLTableElement>>, "className"> {
  classes?: CSSClassNames;
}

/**
 * @name Table
 * @description Table component
 * @param classes - Tailwind classes to <table> element
 * @param props - Other props to <table> element
 */

function Table({ classes, children, ...props }: Props) {
  return (
    <table className={cn(classes)} {...props}>
      {children}
    </table>
  );
}

export default Table;
