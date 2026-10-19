"use client";

import dynamic from "next/dynamic";

export const Form = dynamic(() => import("@/components/structures/Compare/Form"), {
  ssr: false,
});
export const Report = dynamic(() => import("@/components/structures/Compare/Report"), {
  ssr: false,
});
export const Title = dynamic(() => import("@/components/structures/Compare/Title"), {
  ssr: false,
});
