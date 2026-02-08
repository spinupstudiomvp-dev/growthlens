import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const store = mutation({
  args: {
    profileUrlA: v.string(),
    profileUrlB: v.string(),
    profileNameA: v.string(),
    profileNameB: v.string(),
    auditDataA: v.string(),
    auditDataB: v.string(),
    gapAnalysis: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("comparisons", {
      ...args,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const getById = query({
  args: { id: v.id("comparisons") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    return await ctx.db
      .query("comparisons")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit || 50);
  },
});
