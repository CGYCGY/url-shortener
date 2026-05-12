import { createHmac, timingSafeEqual } from "node:crypto";

import type { Id } from "../../convex/_generated/dataModel";

const UNLOCK_TTL_MS = 5 * 60 * 1000;

export function unlockCookieName(linkId: Id<"links">): string {
  return `link-unlock-${linkId}`;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function createUnlockCookieValue(linkId: Id<"links">, secret: string): string {
  const expires = Date.now() + UNLOCK_TTL_MS;
  const payload = `${linkId}:${expires}`;
  return `${expires}.${sign(payload, secret)}`;
}

export function verifyUnlockCookieValue(
  linkId: Id<"links">,
  value: string | undefined,
  secret: string,
): boolean {
  if (!value) return false;
  const dot = value.indexOf(".");
  if (dot <= 0) return false;
  const expiresStr = value.slice(0, dot);
  const signature = value.slice(dot + 1);
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || expires <= Date.now()) return false;

  const expected = sign(`${linkId}:${expires}`, secret);
  if (expected.length !== signature.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"));
  } catch {
    return false;
  }
}

export const UNLOCK_TTL_SECONDS = UNLOCK_TTL_MS / 1000;
