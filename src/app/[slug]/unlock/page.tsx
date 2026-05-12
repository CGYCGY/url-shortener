import { ConvexHttpClient } from "convex/browser";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { env } from "@/env";
import { api } from "../../../../convex/_generated/api";
import { verifyUnlock } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Incorrect password.",
  missing: "Please enter your password.",
  notfound: "This link doesn't exist.",
  config: "Service is misconfigured. Try again later.",
};

export default async function UnlockPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const { error } = await searchParams;

  if (!env.NEXT_PUBLIC_CONVEX_URL) {
    notFound();
  }

  const client = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);
  const link = await client.query(api.links.getBySlug, { slug });
  if (!link) notFound();
  if (!link.linkPasswordHash) redirect(`/${slug}`);

  const message = error ? ERROR_MESSAGES[error] : undefined;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-card p-6">
        <div className="space-y-1.5 text-center">
          <h1 className="font-semibold text-lg">Password required</h1>
          <p className="text-muted-foreground text-sm">
            This link is protected. Enter the password to continue.
          </p>
        </div>
        <form action={verifyUnlock} className="space-y-3">
          <input type="hidden" name="slug" value={slug} />
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="off"
              autoFocus
              required
            />
            {message ? <p className="text-destructive text-xs">{message}</p> : null}
          </div>
          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
      </div>
    </main>
  );
}
