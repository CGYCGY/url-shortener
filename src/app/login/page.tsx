import { getSignInUrl, withAuth } from "@workos-inc/authkit-nextjs";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { user } = await withAuth();
  if (user) redirect("/dashboard");

  const { error } = await searchParams;
  const signInUrl = await getSignInUrl();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">s.gylab.cc</h1>
        <p className="text-muted-foreground text-sm">Self-hosted URL shortener.</p>
      </div>
      <Button asChild size="lg">
        <Link href={signInUrl}>Sign in</Link>
      </Button>
      {error === "callback" ? (
        <p className="text-destructive text-sm">Sign-in failed. Please try again.</p>
      ) : null}
    </main>
  );
}
