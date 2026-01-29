import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("dinnerLogs")
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("dinnerLogs") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getByDinnerId = query({
  args: { dinnerId: v.id("dinners") },
  handler: async (ctx, { dinnerId }) => {
    return await ctx.db
      .query("dinnerLogs")
      .withIndex("by_dinner_id", (q) => q.eq("dinnerId", dinnerId))
      .order("desc")
      .collect();
  },
});

export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    return await ctx.db
      .query("dinnerLogs")
      .order("desc")
      .take(limit);
  },
});

export const getByDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, { startDate, endDate }) => {
    return await ctx.db
      .query("dinnerLogs")
      .withIndex("by_made_at", (q) =>
        q.gte("madeAt", startDate).lte("madeAt", endDate)
      )
      .collect();
  },
});

export const create = mutation({
  args: {
    dinnerId: v.id("dinners"),
    madeAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    rating: v.optional(v.number()),
    servings: v.optional(v.number()),
  },
  handler: async (ctx, { dinnerId, madeAt, notes, rating, servings }) => {
    const dinner = await ctx.db.get(dinnerId);
    if (!dinner) {
      throw new Error("Dinner not found");
    }

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      throw new Error("Rating must be between 1 and 5");
    }

    return await ctx.db.insert("dinnerLogs", {
      dinnerId,
      madeAt: madeAt || Date.now(),
      notes,
      rating,
      servings,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("dinnerLogs"),
    madeAt: v.optional(v.number()),
    notes: v.optional(v.string()),
    rating: v.optional(v.number()),
    servings: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const log = await ctx.db.get(id);
    if (!log) {
      throw new Error("Dinner log not found");
    }

    if (updates.rating !== undefined && (updates.rating < 1 || updates.rating > 5)) {
      throw new Error("Rating must be between 1 and 5");
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("dinnerLogs") },
  handler: async (ctx, { id }) => {
    const log = await ctx.db.get(id);
    if (!log) {
      throw new Error("Dinner log not found");
    }
    await ctx.db.delete(id);
    return id;
  },
});
