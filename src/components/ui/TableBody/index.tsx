import { CSSClassNames } from "@/types";

import { cn } from "@/utils/helpers/styleMerger";

interface Props
  extends Omit<
    React.PropsWithChildren<React.HTMLAttributes<HTMLTableSectionElement>>,
    "className"
  > {
  classes?: CSSClassNames;
}

function TableBody({ children, classes, ...props }: Props) {
  return (
    <tbody className={cn("divide-y-2", classes)} {...props}>
      {children}
    </tbody>
  );
}

export default TableBody;
