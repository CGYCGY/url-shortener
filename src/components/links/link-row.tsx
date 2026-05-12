import { formatDistanceToNow } from "date-fns";
import { Lock } from "lucide-react";
import Link from "next/link";

import { CopyButton } from "@/components/links/copy-button";
import { LinkStatusBadge } from "@/components/links/link-status-badge";
import { buildShortUrl, getLinkStatus } from "@/lib/short-url";
import type { Doc } from "../../../convex/_generated/dataModel";

export function LinkRow({ link }: { link: Doc<"links"> }) {
  const shortUrl = buildShortUrl(link.slug);
  const status = getLinkStatus(link);
  const expiresCaption =
    status === "active" && link.expiresAt !== undefined
      ? `Expires ${formatDistanceToNow(new Date(link.expiresAt), { addSuffix: true })}`
      : null;

  return (
    <li className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/links/${link._id}`}
            className="truncate font-medium text-sm hover:underline"
          >
            /{link.slug}
          </Link>
          {link.linkPasswordHash ? (
            <Lock className="h-3.5 w-3.5 text-muted-foreground" aria-label="Password-protected" />
          ) : null}
          <LinkStatusBadge status={status} />
          {expiresCaption ? (
            <span className="text-muted-foreground text-xs">{expiresCaption}</span>
          ) : null}
        </div>
        <p className="truncate text-muted-foreground text-xs" title={link.destinationUrl}>
          {link.destinationUrl}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-muted-foreground text-xs tabular-nums">
          {link.clickCount} {link.clickCount === 1 ? "click" : "clicks"}
        </span>
        <CopyButton value={shortUrl} label="Copy short URL" />
      </div>
    </li>
  );
}
