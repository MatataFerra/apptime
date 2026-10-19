import Button from "@/components/ui/Button";

import useFinishShift from "@/hooks/useFinishShift";
import useTrack from "@/hooks/useTrack";

type Props = {
  buttonStatus: {
    disabled: boolean;
    apply_variant: boolean;
  };
};

function FinishButton({ buttonStatus }: Props) {
  const { finish, finishing } = useFinishShift();
  const {
    getShift,
    shiftUnclosed: { shift },
  } = useTrack();

  return (
    <Button
      variant="primary"
      classes="h-14 w-full animate-fade-up rounded-lg text-base font-semibold"
      disabled={buttonStatus.disabled || finishing}
      onClick={() => finish(getShift(shift?.id) ?? shift)}
    >
      Finish Shift
    </Button>
  );
}

export default FinishButton;
