import { useQuery } from "@tanstack/react-query";

import ApiEmployers from "@/services/Api/Employer";

import { USE_QUERY_KEYS } from "@/utils/constants/use-query";

/**
 * The user's employers, A to Z. `employers` leaves out the archived ones
 * (list and pickers); `byId` has them all, to name the employer of an old shift.
 */
function useEmployers() {
  const { data, isLoading } = useQuery({
    queryKey: [USE_QUERY_KEYS.EMPLOYERS],
    queryFn: ApiEmployers.getAll.bind(ApiEmployers),
    refetchOnWindowFocus: false,
  });

  const all = data?.employers ?? [];
  const employers = all.filter((employer) => !employer.archived);
  const byId = new Map(all.map((employer) => [employer.id, employer]));

  return { employers, byId, isLoading };
}

export default useEmployers;
