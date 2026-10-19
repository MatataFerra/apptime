import useTrack from "@/hooks/useTrack";

const ENABLED = { disabled: false, apply_variant: true };
const DISABLED = { disabled: true, apply_variant: false };

/** Start is enabled when no shift is running, Finish when one is. */
function useButtonStatus() {
  const { isShiftActive } = useTrack();

  return isShiftActive
    ? { startButton: DISABLED, finishButton: ENABLED }
    : { startButton: ENABLED, finishButton: DISABLED };
}

export default useButtonStatus;
