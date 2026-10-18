import dynamic from "next/dynamic";

import Skeleton from "@/components/ui/Skeleton";
import Stack from "@/components/ui/Stack";
import Table from "@/components/ui/Table";

export const COLUMNS = ["Day", "Hours", "Earnings", "Public Holiday"] as const;
export const COLUMNS_PER_PRODUCTION = ["Day", "Production", "Earnings", "Public Holiday"] as const;

const HourlyBody = dynamic(() => import("@/components/structures/Dashboard/Table/Hourly/Body"), {
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
});

const ProductionBody = dynamic(
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

const HourlyFooter = dynamic(
  () => import("@/components/structures/Dashboard/Table/Hourly/Footer"),
  {
    ssr: false,
  }
);

const ProductionFooter = dynamic(
  () => import("@/components/structures/Dashboard/Table/Production/Footer"),
  {
    ssr: false,
  }
);

const TableHead = dynamic(() => import("@/components/ui/TableHead"), {
  ssr: false,
});

const Tabs = dynamic(() => import("@/components/ui/Tabs").then((mod) => mod.Tabs), {
  ssr: false,
  loading: () => <Skeleton classes="max-h-60 min-h-60 w-full" />,
});

const TabsContent = dynamic(() => import("@/components/ui/Tabs").then((mod) => mod.TabsContent), {
  ssr: false,
  loading: () => <Skeleton classes="h-full w-full" />,
});

const TabsList = dynamic(() => import("@/components/ui/Tabs").then((mod) => mod.TabsList), {
  ssr: false,
});

const TabsTrigger = dynamic(() => import("@/components/ui/Tabs").then((mod) => mod.TabsTrigger), {
  ssr: false,
});

function TableHistory() {
  return (
    <Tabs className="p-2" defaultValue="perHour">
      <Stack classes="p-3" alignItems="center" justifyContent="center">
        <TabsList>
          <TabsTrigger value="perHour">Earns per hour</TabsTrigger>
          <TabsTrigger value="perProduction">Earns per production</TabsTrigger>
        </TabsList>
      </Stack>
      <TabsContent className="m-0 rounded-lg shadow-input" value="perHour">
        <Table classes="h-full min-h-[25dvh] w-full table-fixed">
          <TableHead
            classes="border-b border-b-border-strong text-left text-xs"
            columnTitle={COLUMNS}
            elementClasses="p-4"
          />
          <HourlyBody />
          <HourlyFooter colsNumber={COLUMNS.length} />
        </Table>
      </TabsContent>
      <TabsContent className="m-0 rounded-lg shadow-input" value="perProduction">
        <Table classes="h-full w-full table-fixed">
          <TableHead
            classes="border border-l-0 border-r-0 border-t-0 border-b-border-strong text-left text-xs"
            columnTitle={COLUMNS_PER_PRODUCTION}
            elementClasses="p-4"
          />
          <ProductionBody />
          <ProductionFooter colsNumber={COLUMNS_PER_PRODUCTION.length} />
        </Table>
      </TabsContent>
    </Tabs>
  );
}

export default TableHistory;
