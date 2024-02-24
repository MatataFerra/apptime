import { CSSClassNames } from "@/types";

import { cn } from "@/utils/helpers/styleMerger";

interface Props
  extends Omit<
    React.PropsWithChildren<React.HTMLAttributes<HTMLTableSectionElement>>,
    "className"
  > {
  classes?: CSSClassNames;
}

function TableFoot({ children, classes, ...props }: Props) {
  return (
    <tfoot className={cn(classes)} {...props}>
      <tr>{children}</tr>
    </tfoot>
  );
}

export default TableFoot;
