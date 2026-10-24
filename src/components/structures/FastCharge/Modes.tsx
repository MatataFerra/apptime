"use client";

import type { ReactNode } from "react";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

import Skeleton from "@/components/ui/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

const Batch = dynamic(() => import("@/components/structures/FastCharge/Batch"), {
  ssr: false,
  loading: () => <Skeleton classes="min-h-[50dvh] w-full" />,
});

/** One shift, or the same shift over several days. */
function Modes({ single }: { single: ReactNode }) {
  const t = useTranslations("shift.batch");

  return (
    <Tabs defaultValue="single" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="single">{t("mode_single")}</TabsTrigger>
        <TabsTrigger value="batch">{t("mode_batch")}</TabsTrigger>
      </TabsList>
      {/* Kept mounted: switching tabs doesn't lose what was typed. */}
      <TabsContent value="single" forceMount className="data-[state=inactive]:hidden">
        {single}
      </TabsContent>
      <TabsContent value="batch" className="mt-4">
        <Batch />
      </TabsContent>
    </Tabs>
  );
}

export default Modes;
