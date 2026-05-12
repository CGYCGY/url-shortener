"use client";

import type * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Props extends React.ComponentProps<"input"> {
  error?: string;
}

export function DestinationInput({ className, error, id = "destinationUrl", ...props }: Props) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>Destination URL</Label>
      <Input
        id={id}
        type="url"
        inputMode="url"
        autoComplete="url"
        placeholder="https://example.com/some-page"
        aria-invalid={error ? true : undefined}
        className={cn(error && "border-destructive", className)}
        {...props}
      />
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}
