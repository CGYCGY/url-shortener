"use client";

import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function DisableControl({
  isDisabled,
  shortUrl,
  onDisable,
  onReenable,
  pending,
  error,
}: {
  isDisabled: boolean;
  shortUrl: string;
  onDisable: () => Promise<void> | void;
  onReenable: () => Promise<void> | void;
  pending?: boolean;
  error?: string;
}) {
  const [open, setOpen] = useState(false);

  if (isDisabled) {
    return (
      <div className="space-y-1.5">
        <Button type="button" variant="outline" onClick={() => onReenable()} disabled={pending}>
          {pending ? "Working…" : "Re-enable link"}
        </Button>
        {error ? <p className="text-destructive text-xs">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="destructive" disabled={pending}>
            Disable link
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable this link?</AlertDialogTitle>
            <AlertDialogDescription>
              Disable{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">{shortUrl}</code>?
              Visitors will see a "Gone" page. You can re-enable it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                await onDisable();
                setOpen(false);
              }}
              disabled={pending}
            >
              {pending ? "Disabling…" : "Disable"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {error ? <p className="text-destructive text-xs">{error}</p> : null}
    </div>
  );
}
