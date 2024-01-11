"use client";

import { CSSClassNames } from "@/types";

import Button from "@/components/ui/Button";
import Image from "@/components/ui/Image";
import Text from "@/components/ui/Text";

import { cn } from "@/utils/helpers/styleMerger";

import { useNotesStore } from "@/store/useNotesStore";

interface Props extends Omit<React.HTMLAttributes<HTMLDivElement>, "className"> {
  classes?: CSSClassNames;
  text?: string;
  icon?: JSX.Element;
}

function FloatingActionButton({ classes, text = "Notes", icon }: Props) {
  const { isOn, setIsOn, setIsNotesOpen, isNotesOpen } = useNotesStore();
  return (
    <Button
      as="div"
      variant="outlined"
      classes={cn(
        "absolute bottom-36 right-2 flex size-20 flex-col items-center justify-center rounded-full border bg-gradient-to-br from-green-300 to-blue-400 p-2 shadow-button transition-all active:from-green-400 active:to-blue-500 active:shadow-button-inner",
        classes ? classes : ""
      )}
      onClick={() => {
        if (!isOn) {
          setIsOn(true);
        } else {
          setTimeout(() => setIsOn(false), 1000);
        }

        setIsNotesOpen(!isNotesOpen);
      }}
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
