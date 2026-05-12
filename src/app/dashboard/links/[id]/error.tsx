"use client";

import { AlertCircle } from "lucide-react";
import { useEffect } from "react";

import { ErrorState } from "@/components/error-state";

export default function LinkDetailError({ error }: { error: Error }) {
  useEffect(() => {
    console.error("Link detail error", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center p-6">
      <ErrorState
        icon={<AlertCircle className="h-8 w-8 text-destructive" />}
        title="Link not found"
        description="It may have been deleted, or you may not have access to it."
        actionHref="/dashboard"
        actionLabel="Back to dashboard"
      />
    </main>
  );
}
