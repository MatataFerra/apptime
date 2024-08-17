import type { Contribution } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

import apiContribution from "@/services/Api/Contributions";

type Response = {
  response: boolean;
  message: string;
  contribution: Contribution[];
};

function useContributions() {
  const { data, isLoading } = useQuery<Response>({
    queryKey: ["contributions"],
    queryFn: apiContribution.getAll.bind(apiContribution),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return { data, isLoading };
}

export default useContributions;
