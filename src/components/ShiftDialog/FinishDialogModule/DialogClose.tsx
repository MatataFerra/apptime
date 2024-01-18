import Button from "@/components/ui/Button";
import { DialogClose } from "@/components/ui/Dialog";
import Text from "@/components/ui/Text";

type Props = {
  onFinishShift: () => void;
};

function FinishClose({ onFinishShift }: Props) {
  return (
    <>
      <DialogClose asChild>
        <Button
          data-button={1}
          type="button"
          variant="gradient"
          classes="h-12 w-full p-[3px]"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            // debido al error TypeError: Response body object should not be disturbed or locked
            // se debe detener el comportamiento por defecto del evento
            onFinishShift();
          }}
        >
          <Text
            as="span"
            classes="flex h-full w-full items-center justify-center rounded-[0.3rem] bg-white p-2 text-xs text-black"
          >
            Let&apos;s move on! 🤖
          </Text>
        </Button>
      </DialogClose>
    </>
  );
}

export default FinishClose;
