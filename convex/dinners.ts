import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

async function getDinnerStats(ctx: any) {
  const dinners = await ctx.db.query("dinners").collect();
  const logs = await ctx.db.query("dinnerLogs").collect();

  const stats = dinners.map((dinner: any) => {
    const dinnerLogs = logs.filter((log: any) => log.dinnerId === dinner._id);
    const count = dinnerLogs.length;
    const lastMade = dinnerLogs.length > 0
      ? Math.max(...dinnerLogs.map((log: any) => log.madeAt))
      : null;
    const ratedLogs = dinnerLogs.filter((log: any) => log.rating !== undefined);
    const avgRating = ratedLogs.length > 0
      ? ratedLogs.reduce((sum: number, log: any) => sum + (log.rating || 0), 0) /
        ratedLogs.length
      : null;

    return {
      dinner,
      count,
      lastMade,
      avgRating,
      isFavorite: avgRating !== null && avgRating >= 4,
    };
  });

  return stats.sort((a: any, b: any) => (b.lastMade || 0) - (a.lastMade || 0));
}

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("dinners").order("desc").collect();
  },
});

export const getById = query({
  args: { id: v.id("dinners") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, { category }) => {
    return await ctx.db
      .query("dinners")
      .withIndex("by_category", (q) => q.eq("category", category))
      .collect();
  },
});

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const dinners = await ctx.db.query("dinners").collect();
    const categories = new Set<string>();
    dinners.forEach((dinner) => {
      if (dinner.category) {
        categories.add(dinner.category);
      }
    });
    return Array.from(categories).sort();
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    return await getDinnerStats(ctx);
  },
});

export const getSuggestions = query({
  args: { daysSinceLastMade: v.optional(v.number()) },
  handler: async (ctx, { daysSinceLastMade = 14 }) => {
    const now = Date.now();
    const cutoff = now - daysSinceLastMade * 24 * 60 * 60 * 1000;

    const stats = await getDinnerStats(ctx);

    return stats.filter((stat: any) => {
      const notMadeRecently = stat.lastMade === null || stat.lastMade < cutoff;
      const isGoodRating = stat.avgRating === null || stat.avgRating >= 3;
      return notMadeRecently && isGoodRating;
    });
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    category: v.optional(v.string()),
    estimatedCost: v.optional(v.number()),
    cookingTimeMinutes: v.optional(v.number()),
  },
  handler: async (ctx, { name, category, estimatedCost, cookingTimeMinutes }) => {
    return await ctx.db.insert("dinners", {
      name,
      category,
      estimatedCost,
      cookingTimeMinutes,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("dinners"),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    estimatedCost: v.optional(v.number()),
    cookingTimeMinutes: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const dinner = await ctx.db.get(id);
    if (!dinner) {
      throw new Error("Dinner not found");
    }
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("dinners") },
  handler: async (ctx, { id }) => {
    const logs = await ctx.db
      .query("dinnerLogs")
      .withIndex("by_dinner_id", (q) => q.eq("dinnerId", id))
      .collect();

    for (const log of logs) {
      await ctx.db.delete(log._id);
    }

    const planned = await ctx.db
      .query("plannedDinners")
      .withIndex("by_dinner_id", (q) => q.eq("dinnerId", id))
      .collect();

    for (const plan of planned) {
      await ctx.db.delete(plan._id);
    }

    await ctx.db.delete(id);
    return id;
  },
});
