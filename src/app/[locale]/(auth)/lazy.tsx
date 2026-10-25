"use client";

import dynamic from "next/dynamic";

// The desktop landing (QR code, phone preview, subscribe form) only renders
// off mobile: its own chunk, so phones don't download it with every page.
export const Compatibility = dynamic(() => import("@/components/modules/Desktop/Compatibility"));
