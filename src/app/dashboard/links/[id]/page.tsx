"use client";

import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";

import { ClickListItem } from "@/components/links/click-list-item";
import { DisableControl } from "@/components/links/disable-control";
import { ExpiryPicker } from "@/components/links/expiry-picker";
import { LinkStatusBadge } from "@/components/links/link-status-badge";
import { PasswordSetField } from "@/components/links/password-set-field";
import { QrCode } from "@/components/links/qr-code";
import { ShortUrlDisplay } from "@/components/links/short-url-display";
import { Button } from "@/components/ui/button";
import { buildShortUrl, getLinkStatus } from "@/lib/short-url";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

const CLICKS_PAGE_SIZE = 25;

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof ConvexError) return String(err.data);
  return fallback;
}

export default function LinkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const linkId = id as Id<"links">;

  const link = useQuery(api.links.getById, { id: linkId });
  const {
    results: clicks,
    status: clicksStatus,
    loadMore,
  } = usePaginatedQuery(api.clicks.listByLink, { linkId }, { initialNumItems: CLICKS_PAGE_SIZE });

  const disableMutation = useMutation(api.links.disable);
  const setExpiryMutation = useMutation(api.links.setExpiry);
  const [disablePending, setDisablePending] = useState(false);
  const [disableError, setDisableError] = useState<string | undefined>();
  const [expiryPending, setExpiryPending] = useState(false);
  const [expiryError, setExpiryError] = useState<string | undefined>();

  if (link === undefined) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-6">
        <div className="h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="h-24 animate-pulse rounded-md bg-muted" />
        <div className="h-48 animate-pulse rounded-md bg-muted" />
      </main>
    );
  }

  const shortUrl = buildShortUrl(link.slug);
  const status = getLinkStatus(link);
  const lastClicked = link.lastClickedAt
    ? formatDistanceToNow(new Date(link.lastClickedAt), { addSuffix: true })
    : "never";

  async function handleToggleDisable() {
    setDisablePending(true);
    setDisableError(undefined);
    try {
      await disableMutation({ id: linkId });
    } catch (err) {
      setDisableError(errorMessage(err, "Failed to update link"));
    } finally {
      setDisablePending(false);
    }
  }

  async function handleSetExpiry(timestamp: number) {
    setExpiryPending(true);
    setExpiryError(undefined);
    try {
      await setExpiryMutation({ id: linkId, expiresAt: timestamp });
    } catch (err) {
      setExpiryError(errorMessage(err, "Failed to set expiry"));
    } finally {
      setExpiryPending(false);
    }
  }

  async function handleClearExpiry() {
    setExpiryPending(true);
    setExpiryError(undefined);
    try {
      await setExpiryMutation({ id: linkId, expiresAt: null });
    } catch (err) {
      setExpiryError(errorMessage(err, "Failed to clear expiry"));
    } finally {
      setExpiryPending(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">
            <ArrowLeft />
            Back
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {link.linkPasswordHash ? (
            <Lock className="h-4 w-4 text-muted-foreground" aria-label="Password-protected" />
          ) : null}
          <LinkStatusBadge status={status} />
        </div>
      </header>

      <section className="space-y-3">
        <ShortUrlDisplay url={shortUrl} />
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs uppercase tracking-wide">Destination</p>
          <p className="break-all text-sm">{link.destinationUrl}</p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-muted-foreground text-xs uppercase tracking-wide">Total clicks</p>
          <p className="mt-1 font-semibold text-2xl tabular-nums">{link.clickCount}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-muted-foreground text-xs uppercase tracking-wide">Last clicked</p>
          <p className="mt-1 font-medium text-sm">{lastClicked}</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-base">QR code</h2>
        <QrCode url={shortUrl} slug={link.slug} />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-base">Manage</h2>
        <DisableControl
          isDisabled={link.isDisabled}
          shortUrl={shortUrl}
          onDisable={handleToggleDisable}
          onReenable={handleToggleDisable}
          pending={disablePending}
          error={disableError}
        />
        <PasswordSetField linkId={linkId} hasPassword={Boolean(link.linkPasswordHash)} />
        <ExpiryPicker
          currentExpiry={link.expiresAt}
          onSubmit={handleSetExpiry}
          onClear={handleClearExpiry}
          disabled={expiryPending}
          error={expiryError}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-base">Recent clicks</h2>
        {clicksStatus === "LoadingFirstPage" ? (
          <div className="h-24 animate-pulse rounded-md bg-muted" />
        ) : clicks.length === 0 ? (
          <p className="rounded-md border border-border border-dashed p-6 text-center text-muted-foreground text-sm">
            No clicks yet.
          </p>
        ) : (
          <>
            <ul className="rounded-md border border-border bg-card px-3">
              {clicks.map((click) => (
                <ClickListItem
                  key={click._id}
                  click={{
                    _creationTime: click._creationTime,
                    referrer: click.referrer,
                  }}
                />
              ))}
            </ul>
            {clicksStatus === "CanLoadMore" || clicksStatus === "LoadingMore" ? (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => loadMore(CLICKS_PAGE_SIZE)}
                  disabled={clicksStatus === "LoadingMore"}
                >
                  {clicksStatus === "LoadingMore" ? "Loading…" : "Load more"}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </main>
  );
}
