"use server";

import { ConvexHttpClient } from "convex/browser";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { env } from "@/env";
import { createUnlockCookieValue, UNLOCK_TTL_SECONDS, unlockCookieName } from "@/lib/unlock-cookie";
import { api } from "../../../../convex/_generated/api";

export async function verifyUnlock(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!slug || !password) {
    redirect(`/${encodeURIComponent(slug)}/unlock?error=missing`);
  }

  if (!env.NEXT_PUBLIC_CONVEX_URL) {
    redirect(`/${encodeURIComponent(slug)}/unlock?error=config`);
  }
  if (!env.LINK_UNLOCK_COOKIE_SECRET) {
    redirect(`/${encodeURIComponent(slug)}/unlock?error=config`);
  }

  const client = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);
  const link = await client.query(api.links.getBySlug, { slug });
  if (!link) {
    redirect(`/${encodeURIComponent(slug)}/unlock?error=notfound`);
  }
  if (!link.linkPasswordHash) {
    redirect(`/${encodeURIComponent(slug)}`);
  }

  const result = await client.action(api.links.verifyLinkPassword, {
    id: link._id,
    password,
  });
  if (!result.valid) {
    redirect(`/${encodeURIComponent(slug)}/unlock?error=invalid`);
  }

  const cookieStore = await cookies();
  cookieStore.set(
    unlockCookieName(link._id),
    createUnlockCookieValue(link._id, env.LINK_UNLOCK_COOKIE_SECRET),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: UNLOCK_TTL_SECONDS,
      path: `/${slug}`,
    },
  );

  redirect(`/${encodeURIComponent(slug)}`);
}
