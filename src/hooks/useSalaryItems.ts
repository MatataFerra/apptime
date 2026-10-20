import type { SalaryItems } from "@/types";

export type { SalaryItems };
import { useQuery } from "@tanstack/react-query";

import ApiSalaryItems from "@/services/Api/Salary";

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
