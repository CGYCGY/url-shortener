"use client";

import { format } from "date-fns";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function defaultExpiryValue(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setSeconds(0, 0);
  return toLocalInputValue(d);
}

export function ExpiryPicker({
  currentExpiry,
  onSubmit,
  onClear,
  disabled,
  error,
}: {
  currentExpiry?: number;
  onSubmit: (timestamp: number) => Promise<void> | void;
  onClear: () => Promise<void> | void;
  disabled?: boolean;
  error?: string;
}) {
  const minValue = useMemo(() => toLocalInputValue(new Date()), []);
  const [value, setValue] = useState<string>(() =>
    currentExpiry ? toLocalInputValue(new Date(currentExpiry)) : defaultExpiryValue(),
  );

  async function handleSet() {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return;
    await onSubmit(parsed.getTime());
  }

  return (
    <div className="space-y-3 rounded-md border border-border p-4">
      <div className="space-y-1">
        <p className="font-medium text-sm">Expiry</p>
        <p className="text-muted-foreground text-xs">
          {currentExpiry
            ? `Currently expires ${format(new Date(currentExpiry), "yyyy-MM-dd HH:mm")}`
            : "Currently never expires."}
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="expiresAt">Expires at</Label>
        <Input
          id="expiresAt"
          type="datetime-local"
          value={value}
          min={minValue}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
        />
        {error ? <p className="text-destructive text-xs">{error}</p> : null}
      </div>
      <div className="flex justify-end gap-2">
        {currentExpiry ? (
          <Button type="button" variant="outline" onClick={() => onClear()} disabled={disabled}>
            Clear expiry
          </Button>
        ) : null}
        <Button type="button" onClick={handleSet} disabled={disabled}>
          {currentExpiry ? "Update expiry" : "Set expiry"}
        </Button>
      </div>
    </div>
  );
}
