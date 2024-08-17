import type { Contribution, Tax } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

import ApiSalaryItems from "@/services/Api/Salary";

export type SalaryItems = {
  contributions: Contribution[];
  taxes: Tax[];
};

type Response = {
  response: boolean;
  message: string;
  salaryItems: SalaryItems;
};

function useSalaryItems() {
  const { data, isLoading } = useQuery<Response>({
    queryKey: ["salary"],
    queryFn: ApiSalaryItems.getAll.bind(ApiSalaryItems),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    data,
    isLoading,
  };
}

export default useSalaryItems;
