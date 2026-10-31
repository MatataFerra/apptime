"use client";

import { useEffect } from "react";

import { TIME_ZONE_COOKIE } from "@/utils/constants/timezone";

/** Saves the browser's time zone in a cookie for server components (getUserNow). */
function TimeZoneSync() {
  useEffect(() => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!zone || document.cookie.split("; ").includes(`${TIME_ZONE_COOKIE}=${zone}`)) return;
    const secure = location.protocol === "https:" ? "; secure" : "";
    document.cookie = `${TIME_ZONE_COOKIE}=${zone}; path=/; max-age=31536000; samesite=lax${secure}`;
  }, []);

  return null;
}

export default TimeZoneSync;
