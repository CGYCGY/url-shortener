import { ConvexHttpClient } from "convex/browser";
import { cookies } from "next/headers";

import { env } from "@/env";
import { unlockCookieName, verifyUnlockCookieValue } from "@/lib/unlock-cookie";
import { api } from "../../../convex/_generated/api";

const NOT_FOUND_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Not found</title>
<style>body{font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;color:#171717}h1{font-weight:600;margin:0 0 .5rem}p{margin:0;color:#737373;font-size:.9rem}</style>
</head><body><div><h1>This link doesn't exist.</h1><p>s.gylab.cc</p></div></body></html>`;

const GONE_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Gone</title>
<style>body{font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;color:#171717}h1{font-weight:600;margin:0 0 .5rem}p{margin:0;color:#737373;font-size:.9rem}</style>
</head><body><div><h1>This link is no longer available.</h1><p>s.gylab.cc</p></div></body></html>`;

const HTML_HEADERS = { "content-type": "text/html; charset=utf-8" };

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!env.NEXT_PUBLIC_CONVEX_URL) {
    return new Response("Service not configured", { status: 500 });
  }

  const client = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);
  const link = await client.query(api.links.getBySlug, { slug });

  if (!link) {
    return new Response(NOT_FOUND_HTML, { status: 404, headers: HTML_HEADERS });
  }

  if (link.isDisabled || (link.expiresAt !== undefined && link.expiresAt <= Date.now())) {
    return new Response(GONE_HTML, { status: 410, headers: HTML_HEADERS });
  }

  if (link.linkPasswordHash) {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(unlockCookieName(link._id))?.value;
    const valid =
      env.LINK_UNLOCK_COOKIE_SECRET !== undefined &&
      verifyUnlockCookieValue(link._id, cookie, env.LINK_UNLOCK_COOKIE_SECRET);
    if (!valid) {
      return Response.redirect(new URL(`/${slug}/unlock`, request.url), 302);
    }
  }

  const referrer = request.headers.get("referer") ?? undefined;
  await client.mutation(api.clicks.record, { linkId: link._id, referrer });

  return Response.redirect(link.destinationUrl, 302);
}
