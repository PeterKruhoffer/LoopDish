import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Link } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import { useCSSVariable } from "uniwind";

function StatCard({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string | number;
  subtext?: string;
}) {
  return (
    <ThemedView className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 flex-1 min-w-[100px]">
      <ThemedText className="text-2xl font-bold text-center">{value}</ThemedText>
      <ThemedText className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
        {label}
      </ThemedText>
      {subtext && (
        <ThemedText className="text-xs text-gray-400 dark:text-gray-500 text-center mt-0.5">
          {subtext}
        </ThemedText>
      )}
    </ThemedView>
  );
}

function QuickActionButton({
  icon,
  label,
  href,
  color,
}: {
  icon: string;
  label: string;
  href: string;
  color: string;
}) {
  return (
    <Link href={href as any} asChild>
      <Pressable className="flex-1 min-w-[140px]">
        <ThemedView className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 items-center">
          <IconSymbol name={icon as any} size={28} color={color} />
          <ThemedText className="text-sm font-medium mt-2 text-center">
            {label}
          </ThemedText>
        </ThemedView>
      </Pressable>
    </Link>
  );
}

function RecentMealCard({
  name,
  date,
  rating,
}: {
  name: string;
  date: string;
  rating?: number;
}) {
  return (
    <ThemedView className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 mb-3">
      <ThemedText className="font-semibold text-base">{name}</ThemedText>
      <ThemedView className="flex-row justify-between items-center mt-1">
        <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
          {date}
        </ThemedText>
        {rating && (
          <ThemedView className="flex-row items-center">
            <IconSymbol name="star.fill" size={14} color="#F59E0B" />
            <ThemedText className="text-sm text-gray-600 dark:text-gray-300 ml-1">
              {rating}
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </ThemedView>
  );
}

function SuggestionCard({
  name,
  category,
  lastMade,
}: {
  name: string;
  category?: string;
  lastMade?: string;
}) {
  return (
    <ThemedView className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 mb-3 border border-blue-100 dark:border-blue-800">
      <ThemedText className="font-semibold text-base">{name}</ThemedText>
      <ThemedView className="flex-row justify-between items-center mt-1">
        {category && (
          <ThemedText className="text-sm text-blue-600 dark:text-blue-400">
            {category}
          </ThemedText>
        )}
        {lastMade && (
          <ThemedText className="text-xs text-gray-500 dark:text-gray-400">
            Last: {lastMade}
          </ThemedText>
        )}
      </ThemedView>
    </ThemedView>
  );
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Index() {
  const dashboardStats = useQuery(api.dinners.getDashboardStats);
  const recentMeals = useQuery(api.dinnerLogs.getRecentWithDetails, { limit: 5 });
  const suggestions = useQuery(api.dinners.getSuggestions, { limit: 3 });
  const tabActiveColor = useCSSVariable("--color-tab-active");

  return (
    <ThemedView className="flex-1">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ThemedView className="flex-row justify-between items-center p-4 pt-12">
          <ThemedText type="title">Dinner Dashboard</ThemedText>
          <Link href="/create-dinner" asChild>
            <Pressable className="p-2">
              <IconSymbol
                name="plus.circle.fill"
                size={28}
                color={tabActiveColor as string}
              />
            </Pressable>
          </Link>
        </ThemedView>

        {/* Stats Section */}
        {dashboardStats && (
          <ThemedView className="px-4 mb-6">
            <ThemedView className="flex-row gap-3">
              <StatCard
                label="Total Dinners"
                value={dashboardStats.totalDinners}
              />
              <StatCard
                label="Meals This Week"
                value={dashboardStats.mealsThisWeek}
                subtext={`${dashboardStats.mealsThisMonth} this month`}
              />
            </ThemedView>
            {dashboardStats.averageRating && (
              <ThemedView className="mt-3">
                <StatCard
                  label="Avg Rating"
                  value={`${dashboardStats.averageRating}/5`}
                  subtext={`${dashboardStats.totalMealsCooked} meals cooked`}
                />
              </ThemedView>
            )}
          </ThemedView>
        )}

        {/* Quick Actions */}
        <ThemedView className="px-4 mb-6">
          <ThemedText type="subtitle" className="mb-3">
            Quick Actions
          </ThemedText>
          <ThemedView className="flex-row gap-3 flex-wrap">
            <QuickActionButton
              icon="fork.knife.circle.fill"
              label="Log a Meal"
              href="/log-meal"
              color="#10B981"
            />
            <QuickActionButton
              icon="calendar.circle.fill"
              label="Plan Dinner"
              href="/plan-dinner"
              color="#3B82F6"
            />
          </ThemedView>
        </ThemedView>

        {/* Recently Cooked */}
        {recentMeals && recentMeals.length > 0 && (
          <ThemedView className="px-4 mb-6">
            <ThemedText type="subtitle" className="mb-3">
              Recently Cooked
            </ThemedText>
            {recentMeals.map((meal) => (
              <RecentMealCard
                key={meal._id}
                name={meal.dinner?.name || "Unknown"}
                date={formatDate(meal.madeAt)}
                rating={meal.rating}
              />
            ))}
          </ThemedView>
        )}

        {/* Suggestions */}
        {suggestions && suggestions.length > 0 && (
          <ThemedView className="px-4 mb-6">
            <ThemedText type="subtitle" className="mb-3">
              Suggestions
            </ThemedText>
            <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Dinners you haven't made in a while
            </ThemedText>
            {suggestions.map((suggestion: any) => (
              <SuggestionCard
                key={suggestion.dinner._id}
                name={suggestion.dinner.name}
                category={suggestion.dinner.category}
                lastMade={
                  suggestion.lastMade
                    ? formatDate(suggestion.lastMade)
                    : "Never made"
                }
              />
            ))}
          </ThemedView>
        )}

        {/* Bottom padding */}
        <ThemedView className="h-8" />
      </ScrollView>
    </ThemedView>
  );
}
