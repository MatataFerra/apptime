import { ReactElement } from "react";

import { CSSClassNames } from "@/types";

import { cm } from "@/utils/helpers/styleMerger";

interface Props extends Omit<React.HTMLAttributes<HTMLElement>, "className"> {
  classes?: CSSClassNames;
  children: ReactElement | ReactElement[];
}

function Footer({ classes, children, ...props }: Props) {
  return (
    <footer className={cm("flex flex-col justify-center gap-2", classes)} {...props}>
      {children}
    </footer>
  );
}

export default Footer;
