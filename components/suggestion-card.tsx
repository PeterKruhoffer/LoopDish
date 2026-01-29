import { Text } from "@/components/themed-text";
import { View } from "@/components/themed-view";
import { Pressable } from "react-native";
import { Link } from "expo-router";
import { memo } from "react";
import { DateTime } from "luxon";

// Brutalist suggestion card
// Following vercel-react-native-skills: list-performance-item-memo

interface SuggestionCardProps {
  id: string;
  name: string;
  category?: string;
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
  lastMadeAt,
  timesMade,
  averageRating,
}: SuggestionCardProps) {
  const lastMadeText = lastMadeAt
    ? `Last made ${formatRelativeDate(lastMadeAt)}`
    : "Never made";

  return (
    <Link href={`/(tabs)/progress?dinnerId=${id}`} asChild>
      <Pressable className="w-full">
        <View
          className="flex-row items-center p-4 bg-white dark:bg-[#151718] border-l-4 border-black dark:border-white"
          style={{
            boxShadow: "2px 2px 0px 0px rgba(0,0,0,1)",
          }}
        >
          {/* Content */}
          <View className="flex-1">
            <Text
              type="defaultSemiBold"
              className="text-base uppercase tracking-wide mb-1"
              numberOfLines={1}
            >
              {name}
            </Text>

            <View className="flex-row items-center gap-2">
              {category && (
                <View className="bg-black dark:bg-white px-2 py-0.5">
                  <Text className="text-white dark:text-black text-xs uppercase tracking-wider font-bold">
                    {category}
                  </Text>
                </View>
              )}
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
