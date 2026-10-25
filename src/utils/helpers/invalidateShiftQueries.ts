import type { QueryClient } from "@tanstack/react-query";

import { USE_QUERY_KEYS } from "@/utils/constants/use-query";

/**
 * Mark every query that holds shift data as stale, so screens like the
 * dashboard refetch after a shift is started, finished, created or edited.
 *
 * Active queries refetch now; inactive ones are marked stale and refetch
 * when a screen that uses them mounts (the hooks have a 2 min `staleTime`).
 */
export function invalidateShiftQueries(queryClient: QueryClient) {
  return Promise.all([
    // prefix match: ["user", email]
    queryClient.invalidateQueries({ queryKey: [USE_QUERY_KEYS.USER] }),
    queryClient.invalidateQueries({ queryKey: [USE_QUERY_KEYS.HOURLY] }),
    queryClient.invalidateQueries({ queryKey: [USE_QUERY_KEYS.PRODUCTION] }),
  ]);
}
