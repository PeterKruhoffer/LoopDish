import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("plannedDinners")
      .order("desc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("plannedDinners") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getByDinnerId = query({
  args: { dinnerId: v.id("dinners") },
  handler: async (ctx, { dinnerId }) => {
    return await ctx.db
      .query("plannedDinners")
      .withIndex("by_dinner_id", (q) => q.eq("dinnerId", dinnerId))
      .collect();
  },
});

export const getUpcoming = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 7 }) => {
    const now = Date.now();
    return await ctx.db
      .query("plannedDinners")
      .withIndex("by_planned_for", (q) => q.gte("plannedFor", now))
      .order("asc")
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
      .query("plannedDinners")
      .withIndex("by_planned_for", (q) =>
        q.gte("plannedFor", startDate).lte("plannedFor", endDate)
      )
      .collect();
  },
});

export const getUncooked = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("plannedDinners")
      .withIndex("by_is_cooked", (q) => q.eq("isCooked", false))
      .collect();
  },
});

export const create = mutation({
  args: {
    dinnerId: v.id("dinners"),
    plannedFor: v.number(),
  },
  handler: async (ctx, { dinnerId, plannedFor }) => {
    const dinner = await ctx.db.get(dinnerId);
    if (!dinner) {
      throw new Error("Dinner not found");
    }

    return await ctx.db.insert("plannedDinners", {
      dinnerId,
      plannedFor,
      isCooked: false,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("plannedDinners"),
    plannedFor: v.optional(v.number()),
    isCooked: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const planned = await ctx.db.get(id);
    if (!planned) {
      throw new Error("Planned dinner not found");
    }
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const markAsCooked = mutation({
  args: { id: v.id("plannedDinners") },
  handler: async (ctx, { id }) => {
    const planned = await ctx.db.get(id);
    if (!planned) {
      throw new Error("Planned dinner not found");
    }

    await ctx.db.patch(id, { isCooked: true });

    await ctx.db.insert("dinnerLogs", {
      dinnerId: planned.dinnerId,
      madeAt: Date.now(),
    });

    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("plannedDinners") },
  handler: async (ctx, { id }) => {
    const planned = await ctx.db.get(id);
    if (!planned) {
      throw new Error("Planned dinner not found");
    }
    await ctx.db.delete(id);
    return id;
  },
});
