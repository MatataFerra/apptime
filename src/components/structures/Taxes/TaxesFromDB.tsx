import type { TaxHourlySaved, TaxProductionSaved } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";

import type { UserType } from "@/types";
import type { SuccessApiResponse } from "@/types/api_response";

import Button from "@/components/ui/Button";
import Table from "@/components/ui/Table";
import TableBody from "@/components/ui/TableBody";
import TableElement from "@/components/ui/TableElement";
import TableHead from "@/components/ui/TableHead";
import Text from "@/components/ui/Text";

import useUser from "@/hooks/useUser";

import remove from "@/server-actions/remove-tax";

type Props = {
  taxesFromDB: TaxProductionSaved[] | TaxHourlySaved[];
  type?: "production" | "hourly";
};

function TaxesFromDB({ taxesFromDB, type = "production" }: Props) {
  const queryClient = useQueryClient();
  const { data: user } = useUser();

  function removeSaveTax(taxItem: any) {
    const previousUserData = queryClient.getQueryData<SuccessApiResponse<UserType>>([
      "user",
      user?.email,
    ]);
    //* Optimistic update
    queryClient.cancelQueries({ queryKey: ["user", user?.email] }).then(() => {
      queryClient.setQueryData(["user", user?.email], {
        ...previousUserData,
        user: {
          ...previousUserData?.user,

          config: {
            ...previousUserData?.user.config,
            taxSaved: {
              ...previousUserData?.user.config?.taxSaved,
              hourlyTaxes:
                type === "hourly"
                  ? previousUserData?.user.config?.taxSaved?.hourlyTaxes?.filter(
                      (tax) => tax.id !== taxItem?.id
                    )
                  : previousUserData?.user.config?.taxSaved?.hourlyTaxes,
              productionTaxes:
                type === "production"
                  ? previousUserData?.user.config?.taxSaved?.productionTaxes?.filter(
                      (tax) => tax.id !== taxItem?.id
                    )
                  : previousUserData?.user.config?.taxSaved?.productionTaxes,
            },
          },
        },
      });

      return { previousUserData };
    });
    remove(type, taxItem).then((response) => {
      queryClient.invalidateQueries({
        queryKey: ["user", user?.email],
      });

      if (!response) {
        // reset state if the shift was not created
        queryClient.cancelQueries({ queryKey: ["user", user?.email] }).then(() => {
          queryClient.setQueryData(["user", user?.email], {
            ...previousUserData,
            user: {
              ...previousUserData?.user,
              profile: {
                ...previousUserData?.user.profile,
              },
              shifts: {
                ...previousUserData?.user.shifts,
                hourly: previousUserData?.user.shifts?.hourly,
              },
            },
          });

          return { previousUserData };
        });

        return;
      }
    });
  }

  return (
    <>
      <Text variant="body">Use your saved taxes</Text>
      <Table classes="my-4 w-full rounded-md border border-slate-300/40 p-4">
        <TableHead
          classes="bg-slate-200"
          elementClasses="p-2 text-left"
          columnTitle={["Name", "Value", "Description", "Action"]}
        />
        <TableBody>
          {taxesFromDB.map((tax) => (
            <TableElement as="tr" key={tax.id} classes="w-full !cursor-auto">
              <TableElement>{tax.name}</TableElement>
              <TableElement>{tax.value}%</TableElement>
              <TableElement>{tax.description}</TableElement>
              <TableElement>
                <Button
                  type="button"
                  variant="outlined"
                  size="xs"
                  classes="bg-gradient-to-tl from-red-500 via-salmon to-pink-700  font-semibold text-stone-100"
                  onClick={() => {
                    removeSaveTax(tax);
                  }}
                >
                  Remove
                </Button>
              </TableElement>
            </TableElement>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

export default TaxesFromDB;
