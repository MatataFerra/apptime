"use client";

import { useEffect } from "react";

import { isDateOrder, isTimeFormat } from "@/utils/helpers/dateFormats";
import useUser from "@/hooks/useUser";

import { useDateFormatStore } from "@/store/useDateFormatStore";
import { usePreferencesDraft } from "@/store/usePreferencesDraft";

/** Puts the time and date formats saved in Settings where useDateLocale reads them. */
function DateFormatSync() {
  const { data: user } = useUser();
  // A format picked in Settings shows everywhere at once, before it's saved.
  const draft = usePreferencesDraft((state) => state.draft);
  const time = draft.timeFormat ?? user?.config?.timeFormat;
  const date = draft.dateFormat ?? user?.config?.dateFormat;
  const set = useDateFormatStore((state) => state.set);

  useEffect(() => {
    set({ time: isTimeFormat(time) ? time : "auto", date: isDateOrder(date) ? date : "auto" });
  }, [time, date, set]);

  return null;
}

export default DateFormatSync;
