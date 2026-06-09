/** Normalize app paths for comparisons when trailingSlash is enabled. */
export function pathnameWithoutTrailingSlash(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
}
