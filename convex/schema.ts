import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    linkedinSub: v.optional(v.string()),
    picture: v.optional(v.string()),
    trackedProfiles: v.array(v.string()), // LinkedIn URLs, max 5
    createdAt: v.number(),
    lastLogin: v.number(),
  })
    .index("by_email", ["email"]),

  auditSnapshots: defineTable({
    userId: v.id("users"),
    profileUrl: v.string(),
    auditData: v.string(), // JSON stringified ProfileAudit
    overallScore: v.number(),
    weekNumber: v.number(), // ISO week number
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_profileUrl", ["userId", "profileUrl"])
    .index("by_createdAt", ["createdAt"]),

  audits: defineTable({
    profileUrl: v.string(),
    profileName: v.string(),
    auditData: v.string(), // JSON stringified ProfileAudit
    source: v.string(), // "live" | "mock"
    email: v.optional(v.string()),
    overallScore: v.number(),
    overallGrade: v.string(),
    createdAt: v.number(),
  })
    .index("by_profileUrl", ["profileUrl"])
    .index("by_email", ["email"])
    .index("by_createdAt", ["createdAt"]),

  waitlist: defineTable({
    email: v.string(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"]),

  comparisons: defineTable({
    profileUrlA: v.string(),
    profileUrlB: v.string(),
    profileNameA: v.string(),
    profileNameB: v.string(),
    auditDataA: v.string(),
    auditDataB: v.string(),
    gapAnalysis: v.string(), // JSON stringified GapAnalysis
    email: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_createdAt", ["createdAt"])
    .index("by_email", ["email"]),
});
