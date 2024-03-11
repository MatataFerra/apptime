import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { useShiftStateContext } from "@/store/useShiftStatusStore";

function NotesHeader() {
  const {
    shiftUnclosed: { shift },
  } = useShiftStateContext((state) => state);
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

export default NotesHeader;
