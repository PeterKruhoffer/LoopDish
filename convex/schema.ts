import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  dinners: defineTable({
    name: v.string(),
    category: v.optional(v.string()),
    estimatedCost: v.optional(v.number()),
    cookingTimeMinutes: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_created_at", ["createdAt"]),

  dinnerLogs: defineTable({
    dinnerId: v.id("dinners"),
    madeAt: v.number(),
    notes: v.optional(v.string()),
    rating: v.optional(v.number()),
    servings: v.optional(v.number()),
  })
    .index("by_dinner_id", ["dinnerId"])
    .index("by_made_at", ["madeAt"]),

  plannedDinners: defineTable({
    dinnerId: v.id("dinners"),
    plannedFor: v.number(),
    isCooked: v.boolean(),
  })
    .index("by_dinner_id", ["dinnerId"])
    .index("by_planned_for", ["plannedFor"])
    .index("by_is_cooked", ["isCooked"]),
});
