import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import useTrack from "@/hooks/useTrack";

function Header() {
  const {
    shiftUnclosed: { shift },
  } = useTrack();
  return (
    <Stack classes="m-1 bg-yellow-200 p-2" orientation="vertical">
      <Stack as="header">
        <Text>
          New note on Shift {`${new Date(shift?.startDate ?? Date.now()).toLocaleDateString()}`}
        </Text>
      </Stack>
    </Stack>
  );
}

export default Header;
