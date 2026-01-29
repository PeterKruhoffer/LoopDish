import { View } from "@/components/themed-view";
import { Text } from "@/components/themed-text";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ScrollView } from "react-native";
import { LegendList } from "@legendapp/list";
import { useState, useCallback, memo } from "react";
import { useRouter } from "expo-router";

// Components
import { SectionHeader } from "@/components/section-header";
import { DinnerLogCard } from "@/components/dinner-log-card";
import { SuggestionCard } from "@/components/suggestion-card";
import { QuickAction } from "@/components/quick-action";
import { LogMealModal } from "@/components/log-meal-modal";

// SECTION 1: Recent Meals Component
// Using LegendList with horizontal layout for recent meals
// Following vercel-react-native-skills: list-performance-virtualize

interface RecentMealsSectionProps {
  meals: {
    _id: string;
    dinnerId: string;
    dinner: {
      _id: string;
      name: string;
      category?: string;
    } | null;
    madeAt: number;
    rating?: number;
    notes?: string;
  }[];
}

const RecentMealsSection = memo(function RecentMealsSection({
  meals,
}: RecentMealsSectionProps) {
  if (meals.length === 0) {
    return (
      <View className="px-4">
        <SectionHeader.Root>
          <SectionHeader.Title>Recent Meals</SectionHeader.Title>
          <SectionHeader.Action href="/(tabs)/progress" label="History →" />
        </SectionHeader.Root>
        <View className="p-4 border-2 border-black dark:border-white">
          <Text className="text-center uppercase tracking-wide text-(--color-gray)">
            No meals logged yet
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View>
      <SectionHeader.Root>
        <SectionHeader.Title>Recent Meals</SectionHeader.Title>
        <SectionHeader.Action href="/(tabs)/progress" label="History →" />
      </SectionHeader.Root>

      <LegendList
        data={meals}
        keyExtractor={(item) => item._id}
        estimatedItemSize={140}
        horizontal
        contentContainerStyle={{ paddingHorizontal: 16 }}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) =>
          item.dinner ? (
            <DinnerLogCard
              id={item._id}
              dinnerId={item.dinnerId}
              dinnerName={item.dinner.name}
              category={item.dinner.category}
              madeAt={item.madeAt}
              rating={item.rating}
              notes={item.notes}
            />
          ) : null
        }
      />
    </View>
  );
});

// SECTION 2: Suggestions Component
// Vertical list of dinner suggestions

interface SuggestionsSectionProps {
  suggestions: {
    dinner: {
      _id: string;
      name: string;
      category?: string;
    };
    count: number;
    lastMade: number | null;
    avgRating: number | null;
  }[];
}

const SuggestionsSection = memo(function SuggestionsSection({
  suggestions,
}: SuggestionsSectionProps) {
  if (suggestions.length === 0) {
    return (
      <View className="px-4 mt-8">
        <SectionHeader.Root>
          <SectionHeader.Title>Suggestions</SectionHeader.Title>
        </SectionHeader.Root>
        <View className="p-4 border-2 border-black dark:border-white">
          <Text className="text-center uppercase tracking-wide text-(--color-gray)">
            No suggestions available
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mt-8 px-4">
      <SectionHeader.Root>
        <SectionHeader.Title>Suggestions</SectionHeader.Title>
      </SectionHeader.Root>

      <View className="gap-3">
        {suggestions.map((item) => (
          <SuggestionCard
            key={item.dinner._id}
            id={item.dinner._id}
            name={item.dinner.name}
            category={item.dinner.category}
            lastMadeAt={item.lastMade ?? undefined}
            timesMade={item.count}
            averageRating={item.avgRating ?? undefined}
          />
        ))}
      </View>
    </View>
  );
});

// SECTION 3: Quick Actions Component
// CTA buttons for logging and creating

interface QuickActionsSectionProps {
  onLogMeal: () => void;
  onCreateDinner: () => void;
}

const QuickActionsSection = memo(function QuickActionsSection({
  onLogMeal,
  onCreateDinner,
}: QuickActionsSectionProps) {
  return (
    <View className="mt-8 mb-24">
      <SectionHeader.Root>
        <SectionHeader.Title>Quick Actions</SectionHeader.Title>
      </SectionHeader.Root>

      <QuickAction.Grid>
        <QuickAction.Button
          icon="plus.circle.fill"
          label="Log Meal"
          variant="primary"
          onPress={onLogMeal}
        />
        <QuickAction.Button
          icon="square.and.pencil"
          label="Create"
          variant="secondary"
          onPress={onCreateDinner}
        />
      </QuickAction.Grid>
    </View>
  );
});

// MAIN DASHBOARD COMPONENT

export default function Index() {
  const router = useRouter();
  const [isLogModalVisible, setIsLogModalVisible] = useState(false);

  // Data queries
  const recentMeals = useQuery(api.dinnerLogs.getRecentWithDetails, {
    limit: 3,
  });
  const suggestions = useQuery(api.dinners.getSuggestions, { limit: 5 });
  const dashboardStats = useQuery(api.dinners.getDashboardStats);

  // Get recently logged dinner IDs to filter from suggestions
  const recentDinnerIds = recentMeals?.map((m) => m.dinnerId) ?? [];

  // Callbacks
  const handleLogMeal = useCallback(() => {
    setIsLogModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsLogModalVisible(false);
  }, []);

  const handleCreateDinner = useCallback(() => {
    router.push("/create-dinner-modal");
  }, [router]);

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Stats Overview */}
        {dashboardStats && (
          <View className="flex-row p-4 gap-3">
            <View className="flex-1 p-3 border-2 border-black dark:border-white bg-black dark:bg-white">
              <Text className="text-2xl font-bold text-white dark:text-black text-center">
                {dashboardStats.totalDinners}
              </Text>
              <Text className="text-[10px] uppercase tracking-wider text-white dark:text-black text-center mt-1">
                Total
              </Text>
            </View>
            <View className="flex-1 p-3 border-2 border-black dark:border-white">
              <Text className="text-2xl font-bold text-center">
                {dashboardStats.mealsThisWeek}
              </Text>
              <Text className="text-[10px] uppercase tracking-wider text-(--color-gray) text-center mt-1">
                This Week
              </Text>
            </View>
            <View className="flex-1 p-3 border-2 border-black dark:border-white">
              <Text className="text-2xl font-bold text-center">
                {dashboardStats.averageRating?.toFixed(1) ?? "-"}
              </Text>
              <Text className="text-[10px] uppercase tracking-wider text-(--color-gray) text-center mt-1">
                Avg Rating
              </Text>
            </View>
          </View>
        )}

        {/* SECTION 1: Recent Meals */}
        <RecentMealsSection meals={recentMeals ?? []} />

        {/* SECTION 2: Suggestions */}
        <SuggestionsSection suggestions={suggestions ?? []} />

        {/* SECTION 3: Quick Actions */}
        <QuickActionsSection
          onLogMeal={handleLogMeal}
          onCreateDinner={handleCreateDinner}
        />

        {/* Bottom padding for tab bar */}
        <View className="h-24" />
      </ScrollView>

      {/* Log Meal Modal */}
      <LogMealModal
        visible={isLogModalVisible}
        onClose={handleCloseModal}
        recentlyLoggedIds={recentDinnerIds}
      />

    </View>
  );
}
