import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useCSSVariable } from "uniwind";

export default function CreateDinnerScreen() {
  const router = useRouter();
  const createDinner = useMutation(api.dinners.create);
  const headerText = useCSSVariable("--color-header-text");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [cookingTimeMinutes, setCookingTimeMinutes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await createDinner({
        name: name.trim(),
        category: category.trim() || undefined,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        cookingTimeMinutes: cookingTimeMinutes
          ? parseInt(cookingTimeMinutes, 10)
          : undefined,
      });
      router.back();
    } catch (error) {
      console.error("Failed to create dinner:", error);
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
            <ThemedText type="title">Create Dinner</ThemedText>
            <Pressable onPress={() => router.back()} className="p-2">
              <ThemedText type="link">Cancel</ThemedText>
            </Pressable>
          </ThemedView>

          <ThemedView className="space-y-4">
            <ThemedView>
              <ThemedText className={labelClasses}>Name *</ThemedText>
              <TextInput
                className={inputClasses}
                value={name}
                onChangeText={setName}
                placeholder="Enter dinner name"
                placeholderTextColor="#9CA3AF"
                autoFocus
              />
            </ThemedView>

            <ThemedView>
              <ThemedText className={labelClasses}>Category</ThemedText>
              <TextInput
                className={inputClasses}
                value={category}
                onChangeText={setCategory}
                placeholder="e.g., Italian, Mexican, Quick"
                placeholderTextColor="#9CA3AF"
              />
            </ThemedView>

            <ThemedView>
              <ThemedText className={labelClasses}>Estimated Cost ($)</ThemedText>
              <TextInput
                className={inputClasses}
                value={estimatedCost}
                onChangeText={setEstimatedCost}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
              />
            </ThemedView>

            <ThemedView>
              <ThemedText className={labelClasses}>Cooking Time (minutes)</ThemedText>
              <TextInput
                className={inputClasses}
                value={cookingTimeMinutes}
                onChangeText={setCookingTimeMinutes}
                placeholder="30"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
              />
            </ThemedView>

            <Pressable
              onPress={handleSubmit}
              disabled={!name.trim() || isSubmitting}
              className={`rounded-lg p-4 mt-4 ${
                name.trim() && !isSubmitting
                  ? "bg-blue-500"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <ThemedText
                className="text-center text-white font-semibold text-base"
                style={{ color: "white" }}
              >
                {isSubmitting ? "Creating..." : "Create Dinner"}
              </ThemedText>
            </Pressable>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
