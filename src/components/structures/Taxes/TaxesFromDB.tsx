import { useCallback, useEffect, useRef, useState } from "react";

import type { Tax } from "@prisma/client";
import isEmpty from "lodash/isEmpty";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";
import Table from "@/components/ui/Table";
import TableBody from "@/components/ui/TableBody";
import TableElement from "@/components/ui/TableElement";
import Text from "@/components/ui/Text";

import useTax from "@/hooks/useTax";

type Props = {
  addTax: (tax: Omit<Tax, "id">) => void;
};

const START_PAGINATION = 0;
const TAXES_PER_PAGE = 3;

function TaxesFromDB({ addTax }: Props) {
  const { data } = useTax();
  // Button Load more is disabled when all taxes are loaded
  const [taxesAreDone, setTaxesAreDone] = useState(false);
  const [search, setSearch] = useState("");
  const [taxes, setTaxes] = useState<Tax[]>(data?.tax || []);
  const [page, setPage] = useState({
    start: START_PAGINATION,
    end: TAXES_PER_PAGE,
  });

  const paginateTaxes = useCallback(() => {
    if (page.start >= taxes.length && !isEmpty(taxes)) {
      setTaxesAreDone(true);
      setPage((prev) => ({ ...prev, start: prev.start - TAXES_PER_PAGE, end: taxes.length }));
    }

    let start = page.start < 0 ? START_PAGINATION : page.start;
    let end = page.end > taxes.length ? taxes.length : page.end;

    const taxesPaginated = taxes?.slice(start, end) || [];

    return taxesPaginated;
  }, [page.end, page.start, taxes]);

  const refTaxes = useRef<(HTMLTableCellElement | null)[]>([]);

  useEffect(() => {
    if (data?.tax) {
      setTaxes(data.tax);
    }
  }, [data?.tax]);

  useEffect(() => {
    if (search === "") {
      setTaxes(data?.tax || []);
    } else {
      setTaxes(
        data?.tax.filter((tax) => tax.name.toLowerCase().includes(search.toLowerCase())) || []
      );
    }
  }, [data?.tax, search]);

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
          <Stack classes="my-2">
            <Input
              name="search"
              type="search"
              placeholder="Search taxes"
              aria-label="Search taxes"
              variant="plane"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              classes="w-3/4 rounded-md border border-gray-300 p-2 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </Stack>
          <Table classes="w-full table-auto overflow-y-scroll rounded-xl p-2 shadow-sm">
            <TableBody>
              {paginateTaxes()?.map((tax, index) => {
                return (
                  <TableElement
                    ref={(el) => {
                      if (el) {
                        refTaxes.current[index] = el;
                      }
                    }}
                    data-state="off"
                    as="tr"
                    id={tax.id.toString()}
                    key={tax.id}
                    classes="relative w-full !cursor-auto after:absolute after:inset-0 after:m-auto after:h-fit after:w-fit after:rounded-md after:bg-slate-800/70 after:px-2 after:py-1 after:text-center after:text-white after:content-['added'] after:data-[state=on]:visible after:data-[state=off]:invisible"
                  >
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
                          const getRef = refTaxes.current.find((el) => {
                            return Number(el?.id) === tax.id;
                          });

                          if (getRef) {
                            getRef.setAttribute("data-state", "on");
                            setTimeout(() => {
                              getRef.setAttribute("data-state", "off");
                            }, 750);
                          }

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
                );
              })}
            </TableBody>
          </Table>
          <Stack classes="w-full" justifyContent="end">
            <Button
              type="button"
              variant="secondary"
              size="md"
              classes="w-1/4 font-medium text-slate-900"
              onClick={() => {
                setTaxesAreDone(false);
                setSearch("");
                setPage({
                  start: START_PAGINATION,
                  end: TAXES_PER_PAGE,
                });
              }}
            >
              Reset
            </Button>
            <Button
              type="button"
              variant="black"
              size="md"
              classes="w-fit font-medium text-white"
              disabled={taxesAreDone}
              onClick={() => {
                setPage({
                  start: page.start + TAXES_PER_PAGE,
                  end: page.end + TAXES_PER_PAGE,
                });
              }}
            >
              Load more
            </Button>
          </Stack>
        </Stack>
      )}
    </>
  );
}

export default TaxesFromDB;
