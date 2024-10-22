import { useQueryClient } from "@tanstack/react-query";

import Toast from "@/services/Toast";

import type { HourlyType } from "@/types";
import type { SuccessApiResponse } from "@/types/api_response";

import Button from "@/components/ui/Button";
import { SheetClose } from "@/components/ui/Sheet";
import Stack from "@/components/ui/Stack";

import { USE_QUERY_KEYS } from "@/utils/constants/use-query";
import useHourlyShifts from "@/hooks/useHourlyShifts";

import { useNotes } from "@/store/useNotesStore";

function Buttons() {
  const queryClient = useQueryClient();
  const { shiftUnclosed } = useHourlyShifts();
  const { notes, setlocalNote, setError, setOpen } = useNotes();

  async function onSaveNotes() {
    if (notes.length <= 3) return setError();
    if (!shiftUnclosed) return;

    queryClient.setQueryData([USE_QUERY_KEYS.HOURLY], (old: SuccessApiResponse<HourlyType[]>) => ({
      ...old,
      hourly: old.hourly.map((shift) => {
        if (shift.id === shiftUnclosed.id) {
          return {
            ...shift,
            notes,
          };
        }

        return shift;
      }),
    }));

    setlocalNote(notes);
    setOpen(false);

    Toast({
      message: "Note added",
      type: "plain",
      description: "Your note has been added to the shift.",
      duration: 2000,
    });
  }
  return (
    <Stack orientation="horizontal" justifyContent="end" classes="p-2">
      <SheetClose asChild>
        <Button type="button" variant="danger" size="sm" classes="w-20 select-none">
          Cancel
        </Button>
      </SheetClose>

      <Button
        type="button"
        variant="post-it"
        size="sm"
        classes="w-20 select-none"
        onClick={onSaveNotes}
      >
        Save
      </Button>
    </Stack>
  );
}

export default Buttons;
