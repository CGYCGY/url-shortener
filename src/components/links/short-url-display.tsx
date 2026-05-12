import { CopyButton } from "@/components/links/copy-button";

export function ShortUrlDisplay({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 p-2 pl-3">
      <code className="flex-1 truncate font-mono text-sm">{url}</code>
      <CopyButton value={url} label="Copy short URL" />
    </div>
  );
}
