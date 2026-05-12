import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  links: defineTable({
    slug: v.string(),
    destinationUrl: v.string(),
    createdBy: v.string(),
    isDisabled: v.boolean(),
    expiresAt: v.optional(v.number()),
    linkPasswordHash: v.optional(v.string()),
    clickCount: v.number(),
    lastClickedAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["createdBy"]),

  clicks: defineTable({
    linkId: v.id("links"),
    referrer: v.optional(v.string()),
  }).index("by_link", ["linkId"]),
});
