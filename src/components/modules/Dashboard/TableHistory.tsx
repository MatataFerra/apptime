import Stack from "@/components/ui/Stack";
import Table from "@/components/ui/Table";

import {
  COLUMNS,
  COLUMNS_PER_PRODUCTION,
  HourlyBody,
  HourlyFooter,
  ProductionBody,
  ProductionFooter,
  TableHead,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./TableHistory.lazy";

function TableHistory() {
  return (
    <Tabs className="p-2" defaultValue="perHour">
      <Stack classes="p-2 pb-3" alignItems="center" justifyContent="center">
        <TabsList className="h-10 rounded-full">
          <TabsTrigger
            value="perHour"
            className="h-8 rounded-full px-3.5 data-[state=active]:bg-track-soft data-[state=active]:text-track-ink"
          >
            Earns per hour
          </TabsTrigger>
          <TabsTrigger
            value="perProduction"
            className="h-8 rounded-full px-3.5 data-[state=active]:bg-production-soft data-[state=active]:text-production-ink"
          >
            Earns per production
          </TabsTrigger>
        </TabsList>
      </Stack>
      <TabsContent className="m-0 overflow-hidden rounded-xl border border-border" value="perHour">
        <Table classes="h-full min-h-[25dvh] w-full table-fixed">
          <TableHead
            classes="border-b border-b-border bg-surface-sunken text-left text-xs text-ink-muted"
            columnTitle={COLUMNS}
            elementClasses="p-4"
          />
          <HourlyBody />
          <HourlyFooter colsNumber={COLUMNS.length} />
        </Table>
      </TabsContent>
      <TabsContent
        className="m-0 overflow-hidden rounded-xl border border-border"
        value="perProduction"
      >
        <Table classes="h-full w-full table-fixed">
          <TableHead
            classes="border-b border-b-border bg-surface-sunken text-left text-xs text-ink-muted"
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
