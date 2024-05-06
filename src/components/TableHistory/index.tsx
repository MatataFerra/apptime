import dynamic from "next/dynamic";

import Stack from "@/components/ui/Stack";
import Table from "@/components/ui/Table";

const COLUMNS = ["Day", "Hours", "Earnings", "Public Holiday"] as const;
const COLUMNS_PER_PRODUCTION = ["Day", "Production", "Earnings", "Public Holiday"] as const;

const TableHistoryBody = dynamic(() => import("@/components/TableHistoryBody"), {
  ssr: false,
});

const TablePerProductionBody = dynamic(() => import("@/components/TablePerProductionBody"), {
  ssr: false,
});

const TableHistoryFoot = dynamic(() => import("@/components/TableHistoryFoot"), {
  ssr: false,
});

const TablePerProductionFooter = dynamic(() => import("@/components/TablePerProductionFooter"), {
  ssr: false,
});

const TableHead = dynamic(() => import("@/components/ui/TableHead"), {
  ssr: false,
});

const Tabs = dynamic(() => import("@/components/ui/Tabs").then((mod) => mod.Tabs), {
  ssr: false,
});

const TabsContent = dynamic(() => import("@/components/ui/Tabs").then((mod) => mod.TabsContent), {
  ssr: false,
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
        <Table classes="h-full w-full table-fixed">
          <TableHead
            classes="border-b border-b-gray-900 text-left text-xs"
            columnTitle={COLUMNS}
            elementClasses="p-4"
          />

          <TableHistoryBody />
          <TableHistoryFoot colsNumber={COLUMNS.length} />
        </Table>
      </TabsContent>
      <TabsContent className="m-0 rounded-lg shadow-input" value="perProduction">
        <Table classes="h-full w-full table-fixed">
          <TableHead
            classes="border border-l-0 border-r-0 border-t-0 border-b-gray-900 text-left text-xs"
            columnTitle={COLUMNS_PER_PRODUCTION}
            elementClasses="p-4"
          />
          <TablePerProductionBody />
          <TablePerProductionFooter colsNumber={COLUMNS_PER_PRODUCTION.length} />
        </Table>
      </TabsContent>
    </Tabs>
  );
}

export default TableHistory;
