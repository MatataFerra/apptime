import type { Tax } from "@prisma/client";
import isEmpty from "lodash/isEmpty";

import Button from "@/components/ui/Button";
import Stack from "@/components/ui/Stack";
import Table from "@/components/ui/Table";
import TableBody from "@/components/ui/TableBody";
import TableElement from "@/components/ui/TableElement";
import Text from "@/components/ui/Text";

import useTax from "@/hooks/useTax";

type Props = {
  addTax: (tax: Omit<Tax, "id">) => void;
};

function TaxesFromDB({ addTax }: Props) {
  const { data } = useTax();

  return (
    <>
      {isEmpty(data?.tax) ? null : (
        <Stack as="div" orientation="vertical">
          <Stack as="article" classes="w-3/4" alignItems="center">
            <div className="animate-bounce fill-mode-forwards repeat-1">📢</div>
            <Text
              variant="small"
              classes="animate-pulse text-pretty text-xs fill-mode-backwards repeat-1"
            >
              We found these following taxes that might be useful for you
            </Text>
          </Stack>
          <Table classes="w-full table-auto rounded-xl p-2 shadow-sm">
            <TableBody>
              {data?.tax.map((tax) => (
                <TableElement as="tr" key={tax.id} classes="w-full !cursor-auto">
                  <TableElement>{tax.name}</TableElement>
                  <TableElement>{tax.value}%</TableElement>
                  <TableElement>{tax.description}</TableElement>
                  <TableElement>
                    <Button
                      type="button"
                      variant="secondary"
                      size="xs"
                      classes="font-medium text-slate-900"
                      onClick={() => {
                        addTax({
                          name: tax.name,
                          value: tax.value,
                          description: tax.description,
                        });
                      }}
                    >
                      Add tax
                    </Button>
                  </TableElement>
                </TableElement>
              ))}
            </TableBody>
          </Table>
        </Stack>
      )}
    </>
  );
}

export default TaxesFromDB;
