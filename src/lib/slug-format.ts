export const SLUG_FORMAT = /^[A-Za-z0-9_-]{3,64}$/;

export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  "login",
  "dashboard",
  "api",
  "_next",
  "favicon.ico",
  "robots.txt",
]);

export function isValidSlugFormat(slug: string): boolean {
  return SLUG_FORMAT.test(slug);
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}
