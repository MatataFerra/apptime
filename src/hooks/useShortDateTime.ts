import { format } from "date-fns";

import useDateLocale from "@/hooks/useDateLocale";

/** "Oct 23, 8:00 AM" / "23 oct, 8:00", or "–" for a missing or invalid date. */
function useShortDateTime() {
  const locale = useDateLocale();

  return function shortDateTime(date?: string | Date | null) {
    if (!date) return "–";
    const d = new Date(date);
    return isNaN(d.valueOf()) ? "–" : format(d, "PP p", { locale });
  };
}

export default useShortDateTime;
