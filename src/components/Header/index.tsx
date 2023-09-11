import { CSSClassNames } from "@/types";

import Img from "@/components/Image";
import Text from "@/components/Text";

import { GRADIENTS, HEADER_POSITION } from "@/utils/constants";
import { cm } from "@/utils/helpers";

interface Props {
  position?: "start" | "center" | "end";
  classes?: CSSClassNames;
}

function Header({ position = "start", classes }: Props) {
  return (
    <header
      className={cm("flex items-center justify-start gap-2", classes, HEADER_POSITION[position])}
    >
      <Img src="/assets/apptime-logo.svg" alt="App time logo" width={50} height={50} />
      <Text as="h1" variant="gradient" classes={`text-2xl font-bold ${GRADIENTS.gradient_1}`}>
        App Time
      </Text>
    </header>
  );
}

export default Header;
