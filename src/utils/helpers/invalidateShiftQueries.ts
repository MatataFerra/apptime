import type { QueryClient } from "@tanstack/react-query";

import { USE_QUERY_KEYS } from "@/utils/constants/use-query";

/**
 * Mark every query that holds shift data as stale, so screens like the
 * dashboard refetch after a shift is started, finished, created or edited.
 *
 * The shift hooks use `refetchOnMount: false` and a 2 min `staleTime`, so
 * without this the dashboard keeps showing the cached lists until a reload.
 */
export function invalidateShiftQueries(queryClient: QueryClient) {
  return Promise.all([
    // prefix match: ["user", email]
    queryClient.invalidateQueries({ queryKey: [USE_QUERY_KEYS.USER] }),
    queryClient.invalidateQueries({ queryKey: [USE_QUERY_KEYS.HOURLY] }),
    queryClient.invalidateQueries({ queryKey: [USE_QUERY_KEYS.PRODUCTION] }),
  ]);
}
