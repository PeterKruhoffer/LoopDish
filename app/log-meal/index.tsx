import { Text } from "@/components/themed-text";
import { View } from "@/components/themed-view";
import { FullScreenLoading } from "@/components/full-screen-loading";
import { Pressable, TextInput } from "react-native";
import { memo, useMemo, useState } from "react";
import { Link } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LegendList } from "@legendapp/list";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";

const placeholderTextColor = "#666";

interface DinnerSelectorItemProps {
  id: string;
  name: string;
  category?: string;
  tag?: string;
}

const DinnerSelectorItem = memo(function DinnerSelectorItem({
  id,
  name,
  category,
  tag,
}: DinnerSelectorItemProps) {
  const metaLabel = [category, tag].filter(Boolean).join(" · ");
  return (
    <Link
      href={{
        pathname: "/log-meal/[dinnerId]" as const,
        params: { dinnerId: id },
      }}
      asChild
    >
      <Pressable className="p-4 border-b-2 border-gray-200 dark:border-gray-800">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-base uppercase tracking-wide font-semibold">
              {name}
            </Text>
            {metaLabel ? (
              <Text className="text-sm text-(--color-gray) uppercase tracking-wide mt-1">
                {metaLabel}
              </Text>
            ) : null}
          </View>
          <Text className="text-2xl">&gt;</Text>
        </View>
      </Pressable>
    </Link>
  );
});

export default function LogMealIndex() {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const allDinners = useQuery(api.dinners.getAll);
  const recentMeals = useQuery(api.dinnerLogs.getRecentWithDetails, {
    limit: 4,
  });

  const recentDinnerIds = recentMeals?.map((meal) => meal.dinnerId) ?? [];
  const recentDinnerIdSet = new Set(recentDinnerIds);

  const availableDinners = (allDinners ?? []).filter(
    (dinner) => !recentDinnerIdSet.has(dinner._id),
  );

  const filteredDinners = useMemo(() => {
    if (!searchQuery) return availableDinners;
    const normalizedQuery = searchQuery.toLowerCase();
    return availableDinners.filter(
      (dinner) =>
        dinner.name.toLowerCase().includes(normalizedQuery) ||
        (dinner.category?.toLowerCase() || "").includes(normalizedQuery) ||
        (dinner.tag?.toLowerCase() || "").includes(normalizedQuery),
    );
  }, [availableDinners, searchQuery]);

  if (allDinners === undefined || recentMeals === undefined) {
    return <FullScreenLoading />;
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <View className="p-4 border-b-2 border-gray-200 dark:border-gray-800">
        <View className="flex-row items-center border-2 border-black dark:border-white p-3">
          <IconSymbol name="magnifyingglass" size={20} color="#666" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search dinners..."
            placeholderTextColor={placeholderTextColor}
            className="flex-1 ml-2 text-base"
          />
        </View>
        <Text className="text-xs text-(--color-gray) uppercase tracking-wide mt-3">
          Showing dinners not logged in your last 3 meals
        </Text>
      </View>

      {filteredDinners.length === 0 ? (
        <View className="flex-1 justify-center items-center p-4 gap-2">
          <Text className="text-lg uppercase tracking-wide text-center">
            {searchQuery ? "No dinners found" : "All dinners recently logged"}
          </Text>
        </View>
      ) : (
        <LegendList
          data={filteredDinners}
          keyExtractor={(item) => item._id}
          estimatedItemSize={70}
          className="flex-1"
          renderItem={({ item }) => (
            <DinnerSelectorItem
              id={item._id}
              name={item.name}
              category={item.category}
              tag={item.tag}
            />
          )}
        />
      )}
    </View>
  );
}
