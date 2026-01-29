import { View } from "@/components/themed-view";
import { Text } from "@/components/themed-text";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ScrollView } from "react-native";
import { LegendList } from "@legendapp/list";
import { useCallback, memo } from "react";
import { useRouter } from "expo-router";

// Components
import { SectionHeader } from "@/components/section-header";
import { DinnerLogCard } from "@/components/dinner-log-card";
import { SuggestionCard } from "@/components/suggestion-card";
import { QuickAction } from "@/components/quick-action";

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
      <View className="py-2">
        <SectionHeader.Root>
          <SectionHeader.Title>Recent Meals</SectionHeader.Title>
          <SectionHeader.Action
            href={{ pathname: "/(tabs)/history" }}
            label="History →"
          />
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
    <View className="py-2">
      <SectionHeader.Root>
        <SectionHeader.Title>Recent Meals</SectionHeader.Title>
        <SectionHeader.Action
          href={{ pathname: "/(tabs)/history" }}
          label="History →"
        />
      </SectionHeader.Root>

      <LegendList
        data={meals}
        keyExtractor={(item) => item._id}
        estimatedItemSize={140}
        horizontal
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
      <View className="py-2">
        <SectionHeader.Root>
          <SectionHeader.Title>Suggestions</SectionHeader.Title>
        </SectionHeader.Root>
        <View className="border-2 border-black dark:border-white">
          <Text className="text-center uppercase tracking-wide text-(--color-gray)">
            No suggestions available
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="py-2">
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
    <View className="py-2">
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

  // Data queries
  const recentMeals = useQuery(api.dinnerLogs.getRecentWithDetails, {
    limit: 3,
  });
  const suggestions = useQuery(api.dinners.getSuggestions, { limit: 5 });

  // Get recently logged dinner IDs to filter from suggestions
  // Callbacks
  const handleLogMeal = useCallback(() => {
    router.push("/log-meal-modal");
  }, [router]);

  const handleCreateDinner = useCallback(() => {
    router.push("/create-dinner-modal");
  }, [router]);

  return (
    <ScrollView
      className="flex-1 px-4 bg-white dark:bg-black"
      showsVerticalScrollIndicator={false}
    >
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
  );
}
