import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "expo-router";
import { useState, memo, useCallback } from "react";
import {
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  FlatList,
} from "react-native";

// Memoized list item component - only re-renders when props change
const DinnerListItem = memo(function DinnerListItem({
  id,
  name,
  category,
  isSelected,
  onSelect,
}: {
  id: string;
  name: string;
  category?: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const handlePress = useCallback(() => {
    onSelect(id);
  }, [id, onSelect]);

  return (
    <Pressable
      onPress={handlePress}
      className={`p-3 border-b border-gray-200 dark:border-gray-700 ${
        isSelected
          ? "bg-blue-50 dark:bg-blue-900/30"
          : "bg-white dark:bg-gray-900"
      }`}
    >
      <ThemedText className={isSelected ? "font-semibold" : ""}>
        {name}
      </ThemedText>
      {category && (
        <ThemedText className="text-xs text-gray-500 dark:text-gray-400">
          {category}
        </ThemedText>
      )}
    </Pressable>
  );
});

// Memoized empty state component
const ListEmptyComponent = memo(function ListEmptyComponent() {
  return (
    <ThemedView className="p-4 items-center">
      <ThemedText className="text-gray-500">No dinners found</ThemedText>
    </ThemedView>
  );
});

export default function PlanDinnerScreen() {
  const router = useRouter();
  const dinners = useQuery(api.dinners.getAll);
  const createPlan = useMutation(api.plannedDinners.create);

  const [selectedDinnerId, setSelectedDinnerId] = useState<string | null>(null);
  const [plannedDate, setPlannedDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDinners = dinners?.filter((dinner) =>
    dinner.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Hoisted callback - single instance passed to all list items
  const handleSelectDinner = useCallback((id: string) => {
    setSelectedDinnerId(id);
  }, []);

  // Memoized renderItem to prevent recreating on every render
  const renderDinnerItem = useCallback(
    ({ item }: { item: any }) => (
      <DinnerListItem
        id={item._id}
        name={item.name}
        category={item.category}
        isSelected={selectedDinnerId === item._id}
        onSelect={handleSelectDinner}
      />
    ),
    [selectedDinnerId, handleSelectDinner]
  );

  const handleSubmit = async () => {
    if (!selectedDinnerId || !plannedDate) return;

    setIsSubmitting(true);
    try {
      const date = new Date(plannedDate);
      await createPlan({
        dinnerId: selectedDinnerId as any,
        plannedFor: date.getTime(),
      });
      router.back();
    } catch (error) {
      console.error("Failed to plan dinner:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses =
    "border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-base text-black dark:text-white bg-white dark:bg-gray-900";
  const labelClasses = "text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300";

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split("T")[0];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView className="flex-1">
        <ThemedView className="flex-1 p-4">
          <ThemedView className="flex-row justify-between items-center mb-6">
            <ThemedText type="title">Plan Dinner</ThemedText>
            <Pressable onPress={() => router.back()} className="p-2">
              <ThemedText type="link">Cancel</ThemedText>
            </Pressable>
          </ThemedView>

          {/* Search */}
          <ThemedView className="mb-4">
            <ThemedText className={labelClasses}>Search Dinner</ThemedText>
            <TextInput
              className={inputClasses}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Type to search..."
              placeholderTextColor="#9CA3AF"
              autoFocus
            />
          </ThemedView>

          {/* Dinner List */}
          <ThemedView className="mb-4">
            <ThemedText className={labelClasses}>Select Dinner *</ThemedText>
            <ThemedView className="max-h-48 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <FlatList
                data={filteredDinners}
                keyExtractor={(item) => item._id}
                renderItem={renderDinnerItem}
                ListEmptyComponent={ListEmptyComponent}
              />
            </ThemedView>
          </ThemedView>

          {/* Date Picker */}
          <ThemedView className="mb-4">
            <ThemedText className={labelClasses}>Planned Date *</ThemedText>
            <TextInput
              className={inputClasses}
              value={plannedDate}
              onChangeText={setPlannedDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
            />
            <ThemedText className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Format: YYYY-MM-DD (e.g., {today})
            </ThemedText>
          </ThemedView>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={!selectedDinnerId || !plannedDate || isSubmitting}
            className={`rounded-lg p-4 mt-4 ${
              selectedDinnerId && plannedDate && !isSubmitting
                ? "bg-blue-500"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <ThemedText
              className="text-center text-white font-semibold text-base"
              style={{ color: "white" }}
            >
              {isSubmitting ? "Planning..." : "Plan Dinner"}
            </ThemedText>
          </Pressable>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
