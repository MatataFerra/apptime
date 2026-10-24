"use client";

import type { ReactNode } from "react";

import { useTranslations } from "next-intl";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

/** One shift, or the same shift over several days. */
function BatchModes({ single, batch }: { single: ReactNode; batch: ReactNode }) {
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
        {batch}
      </TabsContent>
    </Tabs>
  );
}

export default BatchModes;
