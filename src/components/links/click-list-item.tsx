import { format, formatDistanceToNow } from "date-fns";

export function ClickListItem({ click }: { click: { _creationTime: number; referrer?: string } }) {
  const date = new Date(click._creationTime);
  return (
    <li className="flex items-baseline justify-between gap-3 border-border border-b py-2 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="truncate text-muted-foreground text-xs" title={click.referrer ?? "—"}>
          {click.referrer ?? "—"}
        </p>
      </div>
      <time
        dateTime={date.toISOString()}
        title={format(date, "yyyy-MM-dd HH:mm:ss")}
        className="shrink-0 text-muted-foreground text-xs tabular-nums"
      >
        {formatDistanceToNow(date, { addSuffix: true })}
      </time>
    </li>
  );
}
