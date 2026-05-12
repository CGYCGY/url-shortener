import { customAlphabet } from "nanoid";

const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export const SLUG_LENGTH = 6;
export const SLUG_FORMAT = /^[A-Za-z0-9_-]{3,64}$/;

export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  "login",
  "dashboard",
  "api",
  "_next",
  "favicon.ico",
  "robots.txt",
]);

const nanoid62 = customAlphabet(BASE62, SLUG_LENGTH);

export function generateSlug(): string {
  return nanoid62();
}

export function isValidSlugFormat(slug: string): boolean {
  return SLUG_FORMAT.test(slug);
}

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}
