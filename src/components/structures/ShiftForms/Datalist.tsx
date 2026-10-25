import { type RefObject, useEffect, useRef } from "react";

import { useOnClickOutside } from "usehooks-ts";

import { useDatalistStore } from "@/components/structures/ShiftForms/store/useDatalistStore";
import Datalist from "@/components/ui/Datalist";

/**
 * Suggestions for the job name of `field` (the input calls
 * `setWriting(field)` as the user types). `onSelect` must update both the
 * form and any store that mirrors it (the review dialog reads the store).
 */
function DatalistShiftNames({
  field,
  data,
  value,
  onSelect,
}: {
  /** Which name input this list belongs to, e.g. "production-batch-name". */
  field: string;
  data: string[] | undefined;
  value: string | null;
  onSelect: (name: string) => void;
}) {
  const open = useDatalistStore((state) => state.writing === field);
  const setWriting = useDatalistStore((state) => state.setWriting);
  const listNamesRef = useRef<HTMLUListElement>(null);
  // Only this list's own clicks keep it open; another form's list is none of its business.
  useOnClickOutside([listNamesRef as RefObject<HTMLElement>], () => {
    if (open) setWriting(null);
  });

  useEffect(() => {
    if (!value && useDatalistStore.getState().writing === field) setWriting(null);
  }, [field, setWriting, value]);

  if (!open) return null;

  return (
    <Datalist
      data={data}
      ref={listNamesRef}
      onSelect={(name) => {
        onSelect(name);
        setWriting(null);
      }}
    />
  );
}

export default DatalistShiftNames;
