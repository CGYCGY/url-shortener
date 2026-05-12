"use client";

import type * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Props extends React.ComponentProps<"input"> {
  error?: string;
}

export function SlugInput({ className, error, id = "customSlug", ...props }: Props) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        Custom slug <span className="font-normal text-muted-foreground">(optional)</span>
      </Label>
      <Input
        id={id}
        type="text"
        autoComplete="off"
        spellCheck={false}
        placeholder="my-link"
        aria-invalid={error ? true : undefined}
        className={cn(error && "border-destructive", className)}
        {...props}
      />
      <p className="text-muted-foreground text-xs">
        3–64 characters of letters, digits, hyphen or underscore. Leave blank to auto-generate.
      </p>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}
