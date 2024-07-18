import Text from "@/components/ui/Text";

import useTrack from "@/hooks/useTrack";

function Header() {
  const {
    shiftUnclosed: { shift },
  } = useTrack();
  return (
    <Text classes="text-left">
      New note on Shift {`${new Date(shift?.startDate ?? Date.now()).toLocaleDateString()}`}
    </Text>
  );
}

export default Header;
