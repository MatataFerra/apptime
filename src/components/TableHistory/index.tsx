import TableHistoryBody from "@/components/TableHistoryBody";
import TableHistoryFoot from "@/components/TableHistoryFoot";
import TablePerProductionBody from "@/components/TablePerProductionBody";
import Stack from "@/components/ui/Stack";
import Table from "@/components/ui/Table";
import TableHead from "@/components/ui/TableHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

const COLUMNS = ["Day", "Hours", "Earnings", "Public Holiday"] as const;
const COLUMNS_PER_PRODUCTION = ["Day", "Production", "Earnings", "Public Holiday"] as const;

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
            classes="border border-l-0 border-r-0 border-t-0 border-b-gray-900 text-left text-xs"
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
        </Table>
      </TabsContent>
    </Tabs>
  );
}

export default TableHistory;
