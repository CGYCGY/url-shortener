export function buildShortUrl(slug: string): string {
  const configured = process.env.NEXT_PUBLIC_BASE_URL;
  if (configured) return `${configured.replace(/\/$/, "")}/${slug}`;
  if (typeof window !== "undefined") return `${window.location.origin}/${slug}`;
  return `/${slug}`;
}

export type LinkStatus = "active" | "disabled" | "expired";

export function getLinkStatus(link: { isDisabled: boolean; expiresAt?: number }): LinkStatus {
  if (link.isDisabled) return "disabled";
  if (link.expiresAt !== undefined && link.expiresAt <= Date.now()) return "expired";
  return "active";
}
