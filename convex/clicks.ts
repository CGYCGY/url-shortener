import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authKit } from "./auth";

const REFERRER_MAX_LENGTH = 1024;

// Public on purpose: the redirect handler at /[slug] runs outside Convex and
// can't invoke internalMutations. Abuse risk is bounded — single-user MVP, no
// PII in click rows, and Caddy-level rate limiting is planned for Phase 7.
export const record = mutation({
  args: {
    linkId: v.id("links"),
    referrer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const referrer = args.referrer?.slice(0, REFERRER_MAX_LENGTH);
    await ctx.db.insert("clicks", { linkId: args.linkId, referrer });

    const link = await ctx.db.get(args.linkId);
    if (!link) return;

    await ctx.db.patch(args.linkId, {
      clickCount: link.clickCount + 1,
      lastClickedAt: Date.now(),
    });
  },
});

export const listByLink = query({
  args: {
    linkId: v.id("links"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await authKit.getAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Not authenticated");
    }

    const link = await ctx.db.get(args.linkId);
    if (!link || link.createdBy !== user.id) {
      throw new ConvexError("Not found");
    }

    return await ctx.db
      .query("clicks")
      .withIndex("by_link", (q) => q.eq("linkId", args.linkId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
