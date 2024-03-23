import { CSSClassNames } from "@/types";

import { cn } from "@/utils/helpers/styleMerger";

interface Props extends Omit<React.HTMLAttributes<HTMLTableSectionElement>, "className"> {
  columnTitle: readonly string[];
  classes?: CSSClassNames;
  elementClasses?: CSSClassNames;
}

/**
 * @description TableHead component
 * @param columnTitle - Array of strings that will be used as the title of the columns
 * @param classes - Tailwind classes to <thead> element
 * @param elementClasses - Tailwind classes to <th> element
 * @param props - Other props to <thead> element
 */
function TableHead({ columnTitle, classes, elementClasses, ...props }: Props) {
  return (
    <>
      <thead className={cn(classes)} {...props}>
        <tr>
          {columnTitle.map((title) => (
            <th key={title} className={cn(elementClasses)}>
              {title}
            </th>
          ))}
        </tr>
      </thead>
    </>
  );
}

export default TableHead;
