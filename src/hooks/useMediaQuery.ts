import { useEffect, useState } from "react";

const MEDIA_QUERIES = {
  mobile: "(max-width: 425px)",
  tablet: "(min-width: 426px) and (max-width: 1023px)",
  desktop: "(min-width: 1024px)",
} as const;

export function useMediaQuery(query: keyof typeof MEDIA_QUERIES): boolean {
  function getMatches(query: string): boolean {
    // Prevents SSR issues
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  }

  const [matches, setMatches] = useState<boolean>(
    getMatches(MEDIA_QUERIES[query])
  );

  function handleChange() {
    setMatches(getMatches(MEDIA_QUERIES[query]));
  }

  useEffect(() => {
    const matchMedia = window.matchMedia(MEDIA_QUERIES[query]);

    // Triggered at the first client-side load and if query changes
    handleChange();

    // Listen matchMedia
    if (matchMedia.addListener) {
      matchMedia.addListener(handleChange);
    } else {
      matchMedia.addEventListener("change", handleChange);
    }

    return () => {
      if (matchMedia.removeListener) {
        matchMedia.removeListener(handleChange);
      } else {
        matchMedia.removeEventListener("change", handleChange);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return matches;
}
