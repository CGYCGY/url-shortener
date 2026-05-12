export function LinkRowSkeleton() {
  return (
    <li className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-3 w-64 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-8 w-8 animate-pulse rounded bg-muted" />
    </li>
  );
}
