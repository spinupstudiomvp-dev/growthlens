import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const store = mutation({
  args: {
    profileUrl: v.string(),
    profileName: v.string(),
    auditData: v.string(),
    source: v.string(),
    email: v.optional(v.string()),
    overallScore: v.number(),
    overallGrade: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("audits", {
      ...args,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const getById = query({
  args: { id: v.id("audits") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    return await ctx.db
      .query("audits")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit || 50);
  },
});

export const count = query({
  args: {},
  handler: async (ctx) => {
    const audits = await ctx.db.query("audits").collect();
    return audits.length;
  },
});

export const listByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("audits")
      .withIndex("by_email", (q) => q.eq("email", email))
      .order("desc")
      .take(50);
  },
});
