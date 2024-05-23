import { ReactNode } from "react";

import { cn } from "@/utils/helpers/styleMerger";

interface Props extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "className"> {
  classes?: string;
  children: ReactNode;
}

function Form({ children, classes, ...props }: Props) {
  return (
    <form className={cn(classes)} {...props}>
      {children}
    </form>
  );
}

export default Form;
