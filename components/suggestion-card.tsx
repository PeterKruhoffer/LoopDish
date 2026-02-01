import { Text } from "@/components/themed-text";
import { View } from "@/components/themed-view";
import { Pressable } from "react-native";
import { Link } from "expo-router";
import { memo } from "react";
import { DateTime } from "luxon";

interface SuggestionCardProps {
  id: string;
  name: string;
  category?: string;
  tag?: string;
  lastMadeAt?: number;
  timesMade?: number;
  averageRating?: number;
}

// Format relative date using luxon
function formatRelativeDate(timestamp: number): string {
  const date = DateTime.fromMillis(timestamp);
  const relative = date.toRelative();
  return relative || date.toFormat("MMM d");
}

export const SuggestionCard = memo(function SuggestionCard({
  id,
  name,
  category,
  tag,
  lastMadeAt,
  timesMade,
  averageRating,
}: SuggestionCardProps) {
  const lastMadeText = lastMadeAt
    ? `Last made ${formatRelativeDate(lastMadeAt)}`
    : "Never made";
  const badges = [
    { value: category, type: "category" },
    { value: tag, type: "tag" },
  ].filter((badge) => Boolean(badge.value));

  return (
    <Link
      href={{
        pathname: "/log-meal/[dinnerId]" as const,
        params: { dinnerId: id },
      }}
      asChild
    >
      <Pressable className="w-full">
        <View className="flex-row items-center p-4 bg-white dark:bg-black border-l-4 border-black dark:border-white">
          {/* Content */}
          <View className="flex-1">
            <Text
              type="defaultSemiBold"
              className="text-base uppercase tracking-wide mb-1"
              numberOfLines={1}
            >
              {name}
            </Text>

            <View className="flex-row flex-wrap items-center gap-2">
              {badges.map((badge) => (
                <View
                  key={`${badge.type}-${badge.value}`}
                  className="bg-black dark:bg-white px-2 py-0.5"
                >
                  <Text className="text-white dark:text-black text-xs uppercase tracking-wider font-bold">
                    {badge.value}
                  </Text>
                </View>
              ))}
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                {lastMadeText}
              </Text>
            </View>

            {(timesMade !== undefined || averageRating !== undefined) && (
              <View className="flex-row items-center gap-3 mt-1">
                {timesMade !== undefined && (
                  <Text className="text-xs text-(--color-gray) uppercase tracking-wide">
                    Made {timesMade} {timesMade === 1 ? "time" : "times"}
                  </Text>
                )}
                {averageRating !== undefined && (
                  <Text className="text-xs text-(--color-gray) uppercase tracking-wide">
                    {averageRating.toFixed(1)}/5 avg
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Arrow indicator */}
          <Text className="text-2xl text-black dark:text-white">→</Text>
        </View>
      </Pressable>
    </Link>
  );
});
