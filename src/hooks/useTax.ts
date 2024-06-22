import { useQuery } from "@tanstack/react-query";

import apiTax from "@/services/Api/Tax";

function useTax() {
  const { data, isLoading } = useQuery({
    queryKey: ["tax"],
    queryFn: apiTax.getAll.bind(apiTax),
    refetchOnWindowFocus: false,
  });

  return { data, isLoading };
}

export default useTax;
