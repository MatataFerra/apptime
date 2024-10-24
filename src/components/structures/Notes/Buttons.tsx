import { useQueryClient } from "@tanstack/react-query";

import Toast from "@/services/Toast";

import type { SuccessApiResponse } from "@/types/api_response";

import Button from "@/components/ui/Button";
import { SheetClose } from "@/components/ui/Sheet";
import Stack from "@/components/ui/Stack";

import { USE_QUERY_KEYS } from "@/utils/constants/use-query";
import useTrackShift, { type TrackShiftResponseType } from "@/hooks/useTrackShift";

import { useNotes } from "@/store/useNotesStore";

function Buttons() {
  const queryClient = useQueryClient();
  const { data } = useTrackShift();
  const { notes, setlocalNote, setError, setOpen } = useNotes();

  async function onSaveNotes() {
    if (notes.length <= 3) return setError();
    if (!data.shift) return;

    queryClient.setQueryData(
      [USE_QUERY_KEYS.TRACK],
      (old: SuccessApiResponse<TrackShiftResponseType>) => ({
        ...old,
        track: {
          ...old.track,
          shift: {
            ...old.track.shift,
            notes,
          },
        },
      })
    );

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
