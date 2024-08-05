import { useEffect, useRef, useState } from "react";

import type { Tax } from "@prisma/client";
import isEmpty from "lodash/isEmpty";

import Buttons from "@/components/structures/Taxes/TaxesFromDB/Buttons";
import Title from "@/components/structures/Taxes/TaxesFromDB/Title";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Stack from "@/components/ui/Stack";
import Table from "@/components/ui/Table";
import TableBody from "@/components/ui/TableBody";
import TableElement from "@/components/ui/TableElement";

import useTax from "@/hooks/useTax";

type Props = {
  addTax: (tax: Omit<Tax, "id">) => void;
};

const START_PAGINATION = 0;
const TAXES_PER_PAGE = 3;

/**
 * @deprecated Legacy component, use `TaxesFromDB` instead.
 */
function Legacy_TaxesFromDB({ addTax }: Props) {
  const { data } = useTax();
  const [search, setSearch] = useState("");
  const [taxes, setTaxes] = useState<Tax[]>(data?.tax || []);
  const [page, setPage] = useState(0);

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
        <Stack as="div" orientation="vertical" classes="p-4">
          <Accordion type="single" collapsible className="w-full rounded-md shadow-md">
            <AccordionItem value="one">
              <AccordionTrigger className="p-4 hover:no-underline">
                <Title />
              </AccordionTrigger>
              <AccordionContent className="px-4">
                <Stack classes="my-2">
                  <Input
                    name="search"
                    type="search"
                    placeholder="Search taxes"
                    aria-label="Search taxes"
                    variant="plane"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    classes="min-h-5 w-2/4 rounded-md border border-gray-300 p-1 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </Stack>
                <Table classes="w-full table-auto rounded-xl p-2 shadow-sm">
                  <TableBody>
                    {data?.tax?.map((tax, index) => {
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
                <Buttons
                  maxPages={taxes.length / TAXES_PER_PAGE}
                  page={page}
                  setSearch={setSearch}
                  setPage={setPage}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Stack>
      )}
    </>
  );
}

export default Legacy_TaxesFromDB;
