import { CSSClassNames } from "@/types";

import Button from "@/components/ui/Button";
import Image from "@/components/ui/Image";
import Text from "@/components/ui/Text";

import { cn } from "@/utils/helpers/styleMerger";

interface Props extends Omit<React.HTMLAttributes<HTMLButtonElement>, "className"> {
  classes?: CSSClassNames;
  text?: string;
  disabled?: boolean;
  icon?: JSX.Element;
}

function FloatingActionButton({ classes, text = "Notes", icon, disabled, ...props }: Props) {
  return (
    <Button
      as="button"
      type="button"
      variant="outlined"
      disabled={disabled}
      classes={cn(
        "absolute bottom-36 right-2 flex size-20 flex-col items-center justify-center rounded-full border bg-gradient-to-br p-2 shadow-button transition-all",
        !disabled ? "from-green-400 to-blue-500" : "from-gray-400 to-gray-600",
        !disabled ? "active:from-green-400 active:to-blue-500 active:shadow-button-inner" : "",
        classes ? classes : ""
      )}
      {...props}
    >
      {icon ? (
        icon
      ) : (
        <Image src="/assets/pencil.svg" alt="Pencil" width={30} height={30} classes="select-none" />
      )}
      {text && (
        <Text as="span" classes="text-base">
          {text}
        </Text>
      )}
    </Button>
  );
}

export default FloatingActionButton;
