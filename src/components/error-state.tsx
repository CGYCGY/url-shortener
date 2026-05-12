import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

export function ErrorState({
  title,
  description,
  actionHref,
  actionLabel,
  icon,
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-10 text-center">
      {icon}
      <h2 className="font-semibold text-lg">{title}</h2>
      {description ? <p className="max-w-sm text-muted-foreground text-sm">{description}</p> : null}
      {actionHref && actionLabel ? (
        <Button asChild variant="outline" className="mt-2">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
