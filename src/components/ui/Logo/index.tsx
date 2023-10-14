import Img from "@/components/ui/Image";
import Text from "@/components/ui/Text";

import { GRADIENTS } from "@/utils/constants/tailwind";

interface Props {
  withText?: boolean;
}

function Logo({ withText }: Props) {
  return (
    <picture className="flex items-center justify-start gap-2">
      <Img src="/assets/apptime-logo.svg" alt="App time logo" width={50} height={50} />
      {withText ? (
        <Text as="h1" variant="gradient" classes={`text-2xl font-bold ${GRADIENTS.gradient_1}`}>
          App Time
        </Text>
      ) : null}
    </picture>
  );
}

export default Logo;
