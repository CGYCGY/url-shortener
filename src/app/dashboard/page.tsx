"use client";

import { usePaginatedQuery } from "convex/react";
import { LinkIcon, Plus } from "lucide-react";
import Link from "next/link";

import { LogoutButton } from "@/app/dashboard/logout-button";
import { EmptyState } from "@/components/empty-state";
import { LinkRow } from "@/components/links/link-row";
import { LinkRowSkeleton } from "@/components/links/link-row-skeleton";
import { Button } from "@/components/ui/button";
import { api } from "../../../convex/_generated/api";

const INITIAL_PAGE_SIZE = 25;

export default function DashboardPage() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.links.listByOwner,
    {},
    { initialNumItems: INITIAL_PAGE_SIZE },
  );

  const isLoadingFirstPage = status === "LoadingFirstPage";
  const isLoadingMore = status === "LoadingMore";
  const canLoadMore = status === "CanLoadMore";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <h1 className="font-semibold text-xl tracking-tight">s.gylab.cc</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/dashboard/new">
              <Plus />
              New link
            </Link>
          </Button>
          <LogoutButton />
        </div>
      </header>

      {isLoadingFirstPage ? (
        <ul className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <LinkRowSkeleton key={`skeleton-${i}`} />
          ))}
        </ul>
      ) : results.length === 0 ? (
        <EmptyState
          icon={<LinkIcon className="h-8 w-8 text-muted-foreground" />}
          title="No links yet"
          description="Create your first short link to get started."
          actionHref="/dashboard/new"
          actionLabel="Create your first link"
        />
      ) : (
        <>
          <ul className="space-y-2">
            {results.map((link) => (
              <LinkRow key={link._id} link={link} />
            ))}
          </ul>
          {canLoadMore || isLoadingMore ? (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => loadMore(INITIAL_PAGE_SIZE)}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? "Loading…" : "Load more"}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
