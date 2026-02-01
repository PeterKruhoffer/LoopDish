import { Text } from "@/components/themed-text";
import { View } from "@/components/themed-view";
import { Pressable } from "react-native";
import { Link } from "expo-router";
import { memo } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import { useCSSVariable } from "uniwind";
import { DateTime } from "luxon";

interface DinnerLogCardProps {
  id: string;
  dinnerId: string;
  dinnerName: string;
  category?: string;
  tag?: string;
  madeAt: number;
  rating?: number;
  notes?: string;
  variant?: "compact" | "full";
}

// Format relative date using luxon
function formatRelativeDate(timestamp: number): string {
  const date = DateTime.fromMillis(timestamp);
  const relative = date.toRelative();
  return relative || date.toFormat("MMM d");
}

export const DinnerLogCard = memo(function DinnerLogCard({
  id,
  dinnerName,
  category,
  tag,
  madeAt,
  rating,
  notes,
  variant = "compact",
}: DinnerLogCardProps) {
  const tabActiveColor = useCSSVariable("--color-tab-active");
  const relativeDate = formatRelativeDate(madeAt);
  const isCompact = variant === "compact";
  const showNotes = variant === "full" && Boolean(notes);
  const badges = [
    { value: category, type: "category" },
    { value: tag, type: "tag" },
  ].filter((badge) => Boolean(badge.value));

  return (
    <Link
      href={{
        pathname: "/history/[id]",
        params: { id },
      }}
      asChild
    >
      <Pressable className={isCompact ? "w-65 mr-3" : "w-full"}>
        <View className="bg-white dark:bg-black p-3 border-2 border-black dark:border-white">
          {/* Title */}
          <Text
            type="defaultSemiBold"
            className="text-base uppercase tracking-wide mb-2"
            numberOfLines={1}
          >
            {dinnerName}
          </Text>

          {/* Category / tag badges */}
          {badges.length > 0 ? (
            <View className="flex-row flex-wrap gap-2 mb-3">
              {badges.map((badge) => (
                <View
                  key={`${badge.type}-${badge.value}`}
                  className="self-start bg-black dark:bg-white px-2 py-1"
                >
                  <Text className="text-white dark:text-black text-xs uppercase tracking-wider font-bold">
                    {badge.value}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Date */}
          <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {relativeDate}
          </Text>

          {/* Rating */}
          {rating ? (
            <View className="flex-row gap-1">
              <IconSymbol
                name="star.fill"
                size={14}
                color={tabActiveColor as string}
              />
              <Text className="text-sm ml-1">{rating}/5</Text>
            </View>
          ) : (
            <Text className="text-xs text-gray-400 uppercase tracking-wide">
              Not rated
            </Text>
          )}

          {showNotes ? (
            <Text
              className="text-xs text-(--color-gray) mt-3"
              numberOfLines={2}
            >
              {notes}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </Link>
  );
});
