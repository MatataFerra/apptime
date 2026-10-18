"use client";

import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";
import Table from "@/components/ui/Table";

export const COLUMNS = ["Day", "Hours", "Earnings", "Public Holiday"] as const;
export const COLUMNS_PER_PRODUCTION = ["Day", "Production", "Earnings", "Public Holiday"] as const;

export const HourlyBody = dynamic(
  () => import("@/components/structures/Dashboard/Table/Hourly/Body"),
  {
    ssr: false,
    loading: () => (
      <tbody>
        <tr>
          <td colSpan={COLUMNS.length}>
            <Skeleton classes="h-full w-full" />
          </td>
        </tr>
      </tbody>
    ),
  }
);
export const ProductionBody = dynamic(
  () => import("@/components/structures/Dashboard/Table/Production/Body"),
  {
    ssr: false,
    loading: () => (
      <tbody>
        <tr>
          <td colSpan={COLUMNS_PER_PRODUCTION.length}>
            <Skeleton classes="h-full w-full" />
          </td>
        </tr>
      </tbody>
    ),
  }
);
export const HourlyFooter = dynamic(
  () => import("@/components/structures/Dashboard/Table/Hourly/Footer"),
  {
    ssr: false,
  }
);
export const ProductionFooter = dynamic(
  () => import("@/components/structures/Dashboard/Table/Production/Footer"),
  {
    ssr: false,
  }
);
export const TableHead = dynamic(() => import("@/components/ui/TableHead"), {
  ssr: false,
});
export const Tabs = dynamic(() => import("@/components/ui/Tabs").then((mod) => mod.Tabs), {
  ssr: false,
  loading: () => <Skeleton classes="max-h-60 min-h-60 w-full" />,
});
export const TabsContent = dynamic(
  () => import("@/components/ui/Tabs").then((mod) => mod.TabsContent),
  {
    ssr: false,
    loading: () => <Skeleton classes="h-full w-full" />,
  }
);
export const TabsList = dynamic(() => import("@/components/ui/Tabs").then((mod) => mod.TabsList), {
  ssr: false,
});
export const TabsTrigger = dynamic(
  () => import("@/components/ui/Tabs").then((mod) => mod.TabsTrigger),
  {
    ssr: false,
  }
);
