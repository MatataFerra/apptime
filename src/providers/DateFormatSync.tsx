"use client";

import { useEffect } from "react";

import { isDateOrder, isTimeFormat } from "@/utils/helpers/dateFormats";
import useUser from "@/hooks/useUser";

import { useDateFormatStore } from "@/store/useDateFormatStore";

/** Puts the time and date formats saved in Settings where useDateLocale reads them. */
function DateFormatSync() {
  const { data: user } = useUser();
  const time = user?.config?.timeFormat;
  const date = user?.config?.dateFormat;
  const set = useDateFormatStore((state) => state.set);

  useEffect(() => {
    set({ time: isTimeFormat(time) ? time : "auto", date: isDateOrder(date) ? date : "auto" });
  }, [time, date, set]);

  return null;
}

export default DateFormatSync;
