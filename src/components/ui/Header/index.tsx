import dynamic from "next/dynamic";

import { CSSClassNames } from "@/types";

import Skeleton from "@/components/ui/Skeleton";

import { HEADER_POSITION } from "@/utils/constants/tailwind";
import { cn } from "@/utils/helpers/styleMerger";

const Logo = dynamic(() => import("@/components/ui/Logo"), {
  loading: () => <Skeleton classes="w-50 h-10" />,
});

interface Props {
  position?: "start" | "center" | "end" | "between";
  classes?: CSSClassNames;
  children?: React.ReactElement | React.ReactElement[];
}

function Header({ position = "start", classes, children }: Props) {
  return (
    <header className={cn("flex items-center", classes, HEADER_POSITION[position])}>
      {children}
      <Logo withText />
    </header>
  );
}

export default Header;
