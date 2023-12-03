import Link from "next/link";

import Stack from "@/components/ui/Stack";
import Text from "@/components/ui/Text";

import { PATH_NAMES } from "@/utils/constants/pathnames";

function ShiftRecorded() {
  return (
    <Stack orientation="vertical" classes="h-full w-full self-start" alignItems="start">
      <Text classes="text-2xl">Time elapsed: 9.35hs</Text>
      <Stack
        orientation="vertical"
        justifyContent="center"
        alignItems="center"
        classes="h-full self-center"
      >
        <Text classes="text-xl">Shift Recorded on</Text>
        <Link href={PATH_NAMES.HISTORY_SHIFT} className="text-xl font-bold text-teal-600 underline">
          History shifts
        </Link>
      </Stack>
    </Stack>
  );
}

export default ShiftRecorded;
