import bcrypt from "bcryptjs";
import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { authKit } from "./auth";
import { generateSlug, isReservedSlug, isValidSlugFormat } from "./lib/slug";
import { isValidDestinationUrl } from "./lib/url";

const MAX_SLUG_RETRIES = 5;
const PASSWORD_MIN_LENGTH = 4;
const BCRYPT_COST = 10;

export const create = mutation({
  args: {
    destinationUrl: v.string(),
    customSlug: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await authKit.getAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Not authenticated");
    }

    if (!isValidDestinationUrl(args.destinationUrl)) {
      throw new ConvexError("Destination URL must be a valid http(s) URL");
    }

    if (args.expiresAt !== undefined && args.expiresAt <= Date.now()) {
      throw new ConvexError("Expiry must be in the future");
    }

    let slug: string;
    if (args.customSlug !== undefined) {
      if (!isValidSlugFormat(args.customSlug)) {
        throw new ConvexError("Slug must be 3–64 characters of letters, digits, '-' or '_'");
      }
      if (isReservedSlug(args.customSlug)) {
        throw new ConvexError("That slug is reserved");
      }
      const existing = await ctx.db
        .query("links")
        .withIndex("by_slug", (q) => q.eq("slug", args.customSlug as string))
        .unique();
      if (existing) {
        throw new ConvexError(`Slug \`${args.customSlug}\` is taken`);
      }
      slug = args.customSlug;
    } else {
      let candidate: string | undefined;
      for (let attempt = 0; attempt < MAX_SLUG_RETRIES; attempt++) {
        const next = generateSlug();
        const existing = await ctx.db
          .query("links")
          .withIndex("by_slug", (q) => q.eq("slug", next))
          .unique();
        if (!existing) {
          candidate = next;
          break;
        }
      }
      if (!candidate) {
        throw new ConvexError(
          "Could not generate a unique slug after several attempts — please retry",
        );
      }
      slug = candidate;
    }

    const id = await ctx.db.insert("links", {
      slug,
      destinationUrl: args.destinationUrl,
      createdBy: user.id,
      isDisabled: false,
      expiresAt: args.expiresAt,
      clickCount: 0,
    });

    return { id, slug };
  },
});

export const listByOwner = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const user = await authKit.getAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Not authenticated");
    }
    return await ctx.db
      .query("links")
      .withIndex("by_owner", (q) => q.eq("createdBy", user.id))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("links")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const getById = query({
  args: { id: v.id("links") },
  handler: async (ctx, args) => {
    const user = await authKit.getAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Not authenticated");
    }
    const link = await ctx.db.get(args.id);
    if (!link || link.createdBy !== user.id) {
      throw new ConvexError("Not found");
    }
    return link;
  },
});

export const disable = mutation({
  args: { id: v.id("links") },
  handler: async (ctx, args) => {
    const user = await authKit.getAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Not authenticated");
    }
    const link = await ctx.db.get(args.id);
    if (!link || link.createdBy !== user.id) {
      throw new ConvexError("Not found");
    }
    const next = !link.isDisabled;
    await ctx.db.patch(args.id, { isDisabled: next });
    return { isDisabled: next };
  },
});

export const setExpiry = mutation({
  args: {
    id: v.id("links"),
    expiresAt: v.union(v.number(), v.null()),
  },
  handler: async (ctx, args) => {
    const user = await authKit.getAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Not authenticated");
    }
    const link = await ctx.db.get(args.id);
    if (!link || link.createdBy !== user.id) {
      throw new ConvexError("Not found");
    }
    if (args.expiresAt !== null && args.expiresAt <= Date.now()) {
      throw new ConvexError("Expiry must be in the future");
    }
    await ctx.db.patch(args.id, {
      expiresAt: args.expiresAt === null ? undefined : args.expiresAt,
    });
    return await ctx.db.get(args.id);
  },
});

export const setPassword = action({
  args: {
    id: v.id("links"),
    password: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const user = await authKit.getAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Not authenticated");
    }

    if (args.password === null) {
      await ctx.runMutation(internal.links.setPasswordHashInternal, {
        id: args.id,
        hash: null,
      });
      return { hasPassword: false };
    }

    if (args.password.length < PASSWORD_MIN_LENGTH) {
      throw new ConvexError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
    }

    const hash = await bcrypt.hash(args.password, BCRYPT_COST);
    await ctx.runMutation(internal.links.setPasswordHashInternal, {
      id: args.id,
      hash,
    });
    return { hasPassword: true };
  },
});

export const setPasswordHashInternal = internalMutation({
  args: {
    id: v.id("links"),
    hash: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const user = await authKit.getAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Not authenticated");
    }
    const link = await ctx.db.get(args.id);
    if (!link || link.createdBy !== user.id) {
      throw new ConvexError("Not found");
    }
    await ctx.db.patch(args.id, {
      linkPasswordHash: args.hash === null ? undefined : args.hash,
    });
  },
});

export const verifyLinkPassword = action({
  args: {
    id: v.id("links"),
    password: v.string(),
  },
  handler: async (ctx, args): Promise<{ valid: boolean }> => {
    const row: { linkPasswordHash: string | undefined } | null = await ctx.runQuery(
      internal.links.getPasswordHashInternal,
      {
        id: args.id,
      },
    );
    if (!row?.linkPasswordHash) {
      return { valid: false };
    }
    const valid = await bcrypt.compare(args.password, row.linkPasswordHash);
    return { valid };
  },
});

export const getPasswordHashInternal = internalQuery({
  args: { id: v.id("links") },
  handler: async (ctx, args) => {
    const link = await ctx.db.get(args.id);
    if (!link) return null;
    return { linkPasswordHash: link.linkPasswordHash };
  },
});
