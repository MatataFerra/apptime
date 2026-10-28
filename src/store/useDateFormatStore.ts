import { create } from "zustand";

import type { DateFormats } from "@/utils/helpers/dateFormats";

/**
 * The time and date formats from Settings, for useDateLocale. Kept in a store
 * (filled by DateFormatSync) so date formatting doesn't need the user query.
 */
export const useDateFormatStore = create<DateFormats & { set: (formats: DateFormats) => void }>(
  (set) => ({
    time: "auto",
    date: "auto",
    set: (formats) => set(formats),
  })
);
