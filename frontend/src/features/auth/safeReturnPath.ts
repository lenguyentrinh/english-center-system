/**
 * Only same-site paths may be used as a post-login destination. Anything else (absolute URLs,
 * protocol-relative `//host`, backslash tricks) would be an open redirect.
 */
export function safeReturnPath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return null;
  return value;
}
