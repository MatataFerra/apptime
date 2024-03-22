import TableHistoryBody from "@/components/TableHistoryBody";
import TableHistoryFoot from "@/components/TableHistoryFoot";
import Table from "@/components/ui/Table";
import TableHead from "@/components/ui/TableHead";

const COLUMNS = ["Day", "Hours", "Earnings", "Public Holiday"] as const;

function TableHistory() {
  return (
    <Table classes="h-full w-full table-fixed">
      <TableHead
        classes="border border-l-0 border-r-0 border-t-0 border-b-gray-900 text-left text-xs"
        columnTitle={COLUMNS}
        elementClasses="p-4"
      />

      <TableHistoryBody />
      <TableHistoryFoot colsNumber={COLUMNS.length} />
    </Table>
  );
}

export default TableHistory;
