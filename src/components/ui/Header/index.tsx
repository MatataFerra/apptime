import { CSSClassNames } from "@/types";

import Logo from "@/components/ui/Logo";

import { HEADER_POSITION } from "@/utils/constants/tailwind";
import { cm } from "@/utils/helpers/styleMerger";

interface Props {
  position?: "start" | "center" | "end" | "between";
  classes?: CSSClassNames;
  children?: React.ReactElement | React.ReactElement[];
}

function Header({ position = "start", classes, children }: Props) {
  return (
    <header className={cm("flex items-center", classes, HEADER_POSITION[position])}>
      {children}
      <Logo withText />
    </header>
  );
}

export default Header;
