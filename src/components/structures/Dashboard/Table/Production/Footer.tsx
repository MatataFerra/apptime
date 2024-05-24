import FooterValues from "@/components/structures/Dashboard/Table/Production/FooterValues";
import TableElement from "@/components/ui/TableElement";
import TableFoot from "@/components/ui/TableFoot";

type Props = {
  colsNumber: number;
};

const MIN_COLS = 3;

function ProductionFooter({ colsNumber }: Props) {
  return (
    <>
      <TableFoot classes="bg-gray-100">
        <TableElement as="th" classes="text-left">
          Totals
        </TableElement>
        <FooterValues />
        {Array.from({ length: colsNumber - MIN_COLS }, (_, i) => (
          <TableElement key={i} />
        ))}
      </TableFoot>
    </>
  );
}

export default ProductionFooter;
