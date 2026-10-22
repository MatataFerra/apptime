import { useQuery } from "@tanstack/react-query";

import type { RateTable } from "@/services/ExchangeRates/convert";

import { useAuthSession } from "@/providers/Session";

/**
 * Daily rates (EUR based) for converting shifts. Only asked for when
 * there's something to convert (`quotes` not empty).
 */
function useExchangeRates({ from, to, quotes }: { from: string; to: string; quotes: string[] }) {
  const { isSignedIn } = useAuthSession();
  const list = [...new Set(quotes)].filter((q) => q !== "EUR").sort();
  const needed = isSignedIn && quotes.length > 0 && !!from && !!to;

  const { data, isLoading } = useQuery({
    queryKey: ["rates", from, to, list.join(",")],
    queryFn: async (): Promise<RateTable> => {
      const params = new URLSearchParams({ from, to, quotes: list.join(",") || "USD" });
      const response = await fetch(`/api/rates?${params}`);
      if (!response.ok) return {};
      return (await response.json()).rates ?? {};
    },
    enabled: needed,
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return { rates: data, isLoading: needed && isLoading };
}

export default useExchangeRates;
