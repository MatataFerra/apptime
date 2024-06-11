import type { Tax } from "@prisma/client";

import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import TableBody from "@/components/ui/TableBody";
import TableElement from "@/components/ui/TableElement";
import TableHead from "@/components/ui/TableHead";

import dataIsEmpty from "@/hoc/dataIsEmpty";

type Props = {
  data: Omit<Tax, "id">[];
  removeTax: (tax: string) => void;
};

function TableTax({ data, removeTax }: Props) {
  return (
    <Table classes="w-full table-auto animate-fade-in px-2 shadow-lg">
      <TableHead
        classes="bg-stone-500/20  text-xs text-gray-800 dark:text-gray-100"
        columnTitle={["Name", "Value", "Description", "Action"]}
        elementClasses="py-2"
      />
      <TableBody>
        {data?.map((tax) => (
          <TableElement as="tr" key={tax.name}>
            <TableElement classes="p-2 text-center text-sm group-hover:cursor-default">
              {tax.name}
            </TableElement>
            <TableElement classes="p-2 text-center text-sm group-hover:cursor-default">
              {tax.value}%
            </TableElement>
            <TableElement classes="p-2 text-center text-sm group-hover:cursor-default">
              {tax.description}
            </TableElement>
            <TableElement classes="p-2">
              <Button
                type="button"
                variant="danger"
                size="xs"
                classes="mx-auto my-0"
                onClick={() => removeTax(tax.name ?? "")}
              >
                Remove
              </Button>
            </TableElement>
          </TableElement>
        ))}
      </TableBody>
    </Table>
  );
}

export default dataIsEmpty(TableTax);
