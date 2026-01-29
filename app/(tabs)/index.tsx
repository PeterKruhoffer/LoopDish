import { View } from "@/components/themed-view";
import { Text } from "@/components/themed-text";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Link } from "expo-router";
import { Pressable, ScrollView } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import { useCSSVariable } from "uniwind";

export default function Index() {
  const dashboardStats = useQuery(api.dinners.getDashboardStats);
  const recentMeals = useQuery(api.dinnerLogs.getRecentWithDetails, {
    limit: 5,
  });
  const suggestions = useQuery(api.dinners.getSuggestions, { limit: 3 });
  const tabActiveColor = useCSSVariable("--color-tab-active");

  return (
    <View className="flex-1">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-between items-center p-4 pt-12">
          <Text type="title">Dinner Dashboard</Text>
          <Link href="/create-dinner" asChild>
            <Pressable className="p-2">
              <IconSymbol
                name="plus.circle.fill"
                size={28}
                color={tabActiveColor as string}
              />
            </Pressable>
          </Link>
        </View>

        {/* Bottom padding */}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
