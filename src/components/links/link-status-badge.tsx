import type { LinkStatus } from "@/lib/short-url";
import { cn } from "@/lib/utils";

const STYLES: Record<LinkStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  disabled: "bg-muted text-muted-foreground",
  expired: "bg-destructive/15 text-destructive",
};

const LABELS: Record<LinkStatus, string> = {
  active: "Active",
  disabled: "Disabled",
  expired: "Expired",
};

export function LinkStatusBadge({ status }: { status: LinkStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs",
        STYLES[status],
      )}
    >
      {LABELS[status]}
    </span>
  );
}
