/**
 * The path to go to after signing in, only if it stays on this site.
 * Anything else falls back to `fallback`.
 *
 * Checking `startsWith("/") && !startsWith("//")` isn't enough: browsers
 * read `/\evil.com` (and tabs or newlines inside it) as `//evil.com`, so
 * the URL is resolved the way the browser would and its origin compared.
 */
export function safeRedirectPath(redirect: string | null | undefined, fallback: string) {
  if (!redirect || !redirect.startsWith("/")) return fallback;

  const base = "https://same.origin";
  try {
    const url = new URL(redirect, base);
    if (url.origin !== base) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
