"use client";

import { useAction } from "convex/react";
import { ConvexError } from "convex/values";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";

const PASSWORD_MIN_LENGTH = 4;

export function PasswordSetField({
  linkId,
  hasPassword,
}: {
  linkId: Id<"links">;
  hasPassword: boolean;
}) {
  const setPassword = useAction(api.links.setPassword);
  const [open, setOpen] = useState(false);
  const [password, setPasswordValue] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [clearPending, setClearPending] = useState(false);
  const [clearError, setClearError] = useState<string | undefined>();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
      return;
    }
    setPending(true);
    setError(undefined);
    try {
      await setPassword({ id: linkId, password });
      setPasswordValue("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof ConvexError ? String(err.data) : "Failed to set password");
    } finally {
      setPending(false);
    }
  }

  async function handleClear() {
    setClearPending(true);
    setClearError(undefined);
    try {
      await setPassword({ id: linkId, password: null });
    } catch (err) {
      setClearError(err instanceof ConvexError ? String(err.data) : "Failed to clear password");
    } finally {
      setClearPending(false);
    }
  }

  return (
    <div className="space-y-3 rounded-md border border-border p-4">
      <div className="space-y-1">
        <p className="font-medium text-sm">Password</p>
        <p className="text-muted-foreground text-xs">
          {hasPassword
            ? "Visitors must enter the password to follow this link."
            : "Optional: require a password to open this link."}
        </p>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        {hasPassword ? (
          <Button type="button" variant="outline" onClick={handleClear} disabled={clearPending}>
            {clearPending ? "Clearing…" : "Clear password"}
          </Button>
        ) : null}
        <Dialog
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) {
              setError(undefined);
              setPasswordValue("");
            }
          }}
        >
          <DialogTrigger asChild>
            <Button type="button">{hasPassword ? "Change password" : "Set password"}</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <DialogHeader>
                <DialogTitle>{hasPassword ? "Change password" : "Set password"}</DialogTitle>
                <DialogDescription>
                  Visitors will be asked for this password before being redirected.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-1.5">
                <Label htmlFor="link-password">Password</Label>
                <Input
                  id="link-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  minLength={PASSWORD_MIN_LENGTH}
                  required
                />
                {error ? <p className="text-destructive text-xs">{error}</p> : null}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Saving…" : "Save password"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {clearError ? <p className="text-destructive text-xs">{clearError}</p> : null}
    </div>
  );
}
