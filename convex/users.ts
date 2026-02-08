import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
  },
});

export const create = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    linkedinSub: v.optional(v.string()),
    picture: v.optional(v.string()),
    trackedProfiles: v.array(v.string()),
    createdAt: v.number(),
    lastLogin: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", args);
  },
});

export const updateLogin = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    linkedinSub: v.optional(v.string()),
    picture: v.optional(v.string()),
    lastLogin: v.number(),
  },
  handler: async (ctx, { id, ...updates }) => {
    const cleaned: Record<string, unknown> = { lastLogin: updates.lastLogin };
    if (updates.name) cleaned.name = updates.name;
    if (updates.linkedinSub) cleaned.linkedinSub = updates.linkedinSub;
    if (updates.picture) cleaned.picture = updates.picture;
    await ctx.db.patch(id, cleaned);
  },
});
