"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { DestinationInput } from "@/components/links/destination-input";
import { ShortUrlDisplay } from "@/components/links/short-url-display";
import { SlugInput } from "@/components/links/slug-input";
import { Button } from "@/components/ui/button";
import { buildShortUrl } from "@/lib/short-url";
import { RESERVED_SLUGS, SLUG_FORMAT } from "@/lib/slug-format";
import { api } from "../../../../convex/_generated/api";

const formSchema = z.object({
  destinationUrl: z
    .string()
    .trim()
    .min(1, "Destination URL is required")
    .refine((value) => {
      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }, "Must be a valid http(s) URL"),
  customSlug: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => value === undefined || value === "" || SLUG_FORMAT.test(value),
      "3–64 characters of letters, digits, '-' or '_'",
    )
    .refine(
      (value) => value === undefined || value === "" || !RESERVED_SLUGS.has(value),
      "That slug is reserved",
    ),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewLinkPage() {
  const createLink = useMutation(api.links.create);
  const [created, setCreated] = useState<{ slug: string } | null>(null);
  const [topError, setTopError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { destinationUrl: "", customSlug: "" },
  });

  async function onSubmit(values: FormValues) {
    setTopError(null);
    try {
      const result = await createLink({
        destinationUrl: values.destinationUrl,
        customSlug:
          values.customSlug && values.customSlug.length > 0 ? values.customSlug : undefined,
      });
      setCreated({ slug: result.slug });
    } catch (err) {
      const message = err instanceof ConvexError ? String(err.data) : "Failed to create link";
      if (/taken/i.test(message)) {
        setError("customSlug", { message });
      } else if (/reserved/i.test(message)) {
        setError("customSlug", { message });
      } else if (/slug must be/i.test(message)) {
        setError("customSlug", { message });
      } else if (/destination url/i.test(message)) {
        setError("destinationUrl", { message });
      } else {
        setTopError(message);
      }
    }
  }

  function onCreateAnother() {
    setCreated(null);
    setTopError(null);
    reset();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">
            <ArrowLeft />
            Back
          </Link>
        </Button>
      </header>

      <div className="space-y-1.5">
        <h1 className="font-semibold text-2xl tracking-tight">New short link</h1>
        <p className="text-muted-foreground text-sm">
          Paste a destination URL. Optionally pick a custom slug.
        </p>
      </div>

      {created ? (
        <section className="space-y-4 rounded-lg border border-border p-5">
          <div className="space-y-1">
            <p className="font-medium text-sm">Your short link is ready</p>
            <p className="text-muted-foreground text-xs">Share it anywhere.</p>
          </div>
          <ShortUrlDisplay url={buildShortUrl(created.slug)} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
            <Button onClick={onCreateAnother}>Create another</Button>
          </div>
        </section>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {topError ? (
            <p className="rounded-md border border-destructive bg-destructive/10 p-3 text-destructive text-sm">
              {topError}
            </p>
          ) : null}
          <DestinationInput
            {...register("destinationUrl")}
            error={errors.destinationUrl?.message}
          />
          <SlugInput {...register("customSlug")} error={errors.customSlug?.message} />
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create link"}
            </Button>
          </div>
        </form>
      )}
    </main>
  );
}
