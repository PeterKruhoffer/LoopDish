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

export default function LogMealScreen() {
  const router = useRouter();
  const dinners = useQuery(api.dinners.getAll);
  const createLog = useMutation(api.dinnerLogs.create);

  const [selectedDinnerId, setSelectedDinnerId] = useState<string | null>(null);
  const [rating, setRating] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [servings, setServings] = useState("");
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
    if (!selectedDinnerId) return;

    setIsSubmitting(true);
    try {
      await createLog({
        dinnerId: selectedDinnerId as any,
        rating: rating ? parseInt(rating, 10) : undefined,
        notes: notes.trim() || undefined,
        servings: servings ? parseInt(servings, 10) : undefined,
      });
      router.back();
    } catch (error) {
      console.error("Failed to log meal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses =
    "border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-base text-black dark:text-white bg-white dark:bg-gray-900";
  const labelClasses = "text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView className="flex-1">
        <ThemedView className="flex-1 p-4">
          <ThemedView className="flex-row justify-between items-center mb-6">
            <ThemedText type="title">Log a Meal</ThemedText>
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

          {/* Rating */}
          <ThemedView className="mb-4">
            <ThemedText className={labelClasses}>Rating (1-5)</ThemedText>
            <TextInput
              className={inputClasses}
              value={rating}
              onChangeText={(text) => {
                const num = parseInt(text);
                if (text === "" || (num >= 1 && num <= 5)) {
                  setRating(text);
                }
              }}
              placeholder="1-5 stars"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              maxLength={1}
            />
          </ThemedView>

          {/* Servings */}
          <ThemedView className="mb-4">
            <ThemedText className={labelClasses}>Servings</ThemedText>
            <TextInput
              className={inputClasses}
              value={servings}
              onChangeText={setServings}
              placeholder="Number of servings"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
            />
          </ThemedView>

          {/* Notes */}
          <ThemedView className="mb-4">
            <ThemedText className={labelClasses}>Notes</ThemedText>
            <TextInput
              className={`${inputClasses} min-h-[80px]`}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any notes about this meal..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
            />
          </ThemedView>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={!selectedDinnerId || isSubmitting}
            className={`rounded-lg p-4 mt-4 ${
              selectedDinnerId && !isSubmitting
                ? "bg-green-500"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <ThemedText
              className="text-center text-white font-semibold text-base"
              style={{ color: "white" }}
            >
              {isSubmitting ? "Logging..." : "Log Meal"}
            </ThemedText>
          </Pressable>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
