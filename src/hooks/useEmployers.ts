import { useQuery } from "@tanstack/react-query";

import ApiEmployers from "@/services/Api/Employer";

import { USE_QUERY_KEYS } from "@/utils/constants/use-query";

/** The user's employers (not archived), A to Z. */
function useEmployers() {
  const { data, isLoading } = useQuery({
    queryKey: [USE_QUERY_KEYS.EMPLOYERS],
    queryFn: ApiEmployers.getAll.bind(ApiEmployers),
    refetchOnWindowFocus: false,
  });

  return { employers: data?.employers ?? [], isLoading };
}

export default useEmployers;
