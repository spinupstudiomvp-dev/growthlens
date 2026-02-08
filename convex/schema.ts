import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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
