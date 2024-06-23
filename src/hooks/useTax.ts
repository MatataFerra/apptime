import type { Tax } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

import apiTax from "@/services/Api/Tax";

type Response = {
  response: boolean;
  message: string;
  tax: Tax[];
};

function useTax() {
  const { data, isLoading } = useQuery<Response>({
    queryKey: ["tax"],
    queryFn: apiTax.getAll.bind(apiTax),
    refetchOnWindowFocus: false,
  });

  return { data, isLoading };
}

export default useTax;
