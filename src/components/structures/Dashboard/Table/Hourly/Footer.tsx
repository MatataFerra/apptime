import FooterValues from "@/components/structures/Dashboard/Table/Hourly/FooterValues";
import TableElement from "@/components/ui/TableElement";
import TableFoot from "@/components/ui/TableFoot";

type Props = {
  colsNumber: number;
};

const MIN_COLS = 3;

function HourlyFooter({ colsNumber }: Props) {
  return (
    <TableFoot classes="bg-surface-sunken">
      <TableElement as="th" classes="text-left">
        Totals
      </TableElement>
      <FooterValues />
      {Array.from({ length: colsNumber - MIN_COLS }, (_, i) => (
        <TableElement key={i} />
      ))}
    </TableFoot>
  );
}

export default HourlyFooter;
