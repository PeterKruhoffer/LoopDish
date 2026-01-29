import { Text } from "@/components/themed-text";
import { View } from "@/components/themed-view";
import { Modal, Pressable, TextInput } from "react-native";
import { useState, useCallback, memo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LegendList } from "@legendapp/list";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import { useCSSVariable } from "uniwind";

// Log Meal Modal with brutalist design
// Following vercel-react-native-skills: ui-native-modals
// Using compound component pattern per vercel-composition-patterns

interface LogMealModalProps {
  visible: boolean;
  onClose: () => void;
  recentlyLoggedIds: string[];
}

// Dinner selector item - memoized for performance
interface DinnerSelectorItemProps {
  id: string;
  name: string;
  category?: string;
  onSelect: (id: string, name: string) => void;
}

const DinnerSelectorItem = memo(function DinnerSelectorItem({
  id,
  name,
  category,
  onSelect,
}: DinnerSelectorItemProps) {
  const handlePress = useCallback(() => {
    onSelect(id, name);
  }, [id, name, onSelect]);

  return (
    <Pressable
      onPress={handlePress}
      className="p-4 border-b-2 border-gray-200 dark:border-gray-800"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base uppercase tracking-wide font-semibold">
            {name}
          </Text>
          {category && (
            <Text className="text-sm text-(--color-gray) uppercase tracking-wide mt-1">
              {category}
            </Text>
          )}
        </View>
        <Text className="text-2xl">→</Text>
      </View>
    </Pressable>
  );
});

// Rating selector component
interface RatingSelectorProps {
  value: number;
  onChange: (rating: number) => void;
}

function RatingSelector({ value, onChange }: RatingSelectorProps) {
  const tabActiveColor = useCSSVariable("--color-tab-active");

  return (
    <View className="flex-row gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} onPress={() => onChange(star)} className="p-1">
          <IconSymbol
            name={star <= value ? "star.fill" : "star"}
            size={28}
            color={
              star <= value
                ? (tabActiveColor as string)
                : "rgba(128,128,128,0.3)"
            }
          />
        </Pressable>
      ))}
    </View>
  );
}

// Main modal component
export function LogMealModal({
  visible,
  onClose,
  recentlyLoggedIds,
}: LogMealModalProps) {
  const [step, setStep] = useState<"select" | "details">("select");
  const [selectedDinner, setSelectedDinner] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Get all dinners and filter out recently logged ones
  const allDinners = useQuery(api.dinners.getAll) ?? [];
  const createLog = useMutation(api.dinnerLogs.create);

  // Filter dinners
  const availableDinners = allDinners.filter(
    (dinner) => !recentlyLoggedIds.includes(dinner._id),
  );

  // Filter by search
  const filteredDinners = searchQuery
    ? availableDinners.filter(
        (d) =>
          d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (d.category?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
      )
    : availableDinners;

  const handleSelectDinner = useCallback((id: string, name: string) => {
    setSelectedDinner({ id, name });
    setStep("details");
  }, []);

  const handleBack = useCallback(() => {
    if (step === "details") {
      setStep("select");
      setSelectedDinner(null);
      setRating(0);
      setNotes("");
    } else {
      onClose();
    }
  }, [step, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!selectedDinner) return;

    await createLog({
      dinnerId: selectedDinner.id as any,
      madeAt: Date.now(),
      rating: rating > 0 ? rating : undefined,
      notes: notes || undefined,
    });

    // Reset and close
    setStep("select");
    setSelectedDinner(null);
    setRating(0);
    setNotes("");
    setSearchQuery("");
    onClose();
  }, [selectedDinner, rating, notes, createLog, onClose]);

  // Reset state when modal closes
  const handleClose = useCallback(() => {
    setStep("select");
    setSelectedDinner(null);
    setRating(0);
    setNotes("");
    setSearchQuery("");
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      presentationStyle="formSheet"
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-white dark:bg-[#151718]">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b-2 border-black dark:border-white">
          <Pressable onPress={handleBack} className="p-2">
            <Text className="text-base uppercase tracking-wide font-bold text-(--color-gray) dark:text-white">
              {step === "details" ? "← Back" : "Cancel"}
            </Text>
          </Pressable>

          <Text className="text-lg uppercase tracking-wider font-bold">
            {step === "select" ? "Log Meal" : "Add Details"}
          </Text>

          {step === "details" ? (
            <Pressable onPress={handleSubmit} className="p-2">
              <Text className="text-base uppercase tracking-wide font-bold text-(--color-gray) dark:text-white">
                Save
              </Text>
            </Pressable>
          ) : (
            <View className="w-12" />
          )}
        </View>

        {/* Content */}
        {step === "select" ? (
          <View className="flex-1">
            {/* Search */}
            <View className="p-4 border-b-2 border-gray-200 dark:border-gray-800">
              <View className="flex-row items-center border-2 border-black dark:border-white p-3">
                <IconSymbol name="magnifyingglass" size={20} color="#666" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search dinners..."
                  placeholderTextColor="#666"
                  className="flex-1 ml-2 text-base"
                />
              </View>
            </View>

            {/* Dinner list */}
            {filteredDinners.length === 0 ? (
              <View className="flex-1 justify-center items-center p-4">
                <Text className="text-lg uppercase tracking-wide text-center">
                  {searchQuery
                    ? "No dinners found"
                    : "All dinners recently logged"}
                </Text>
              </View>
            ) : (
              <LegendList
                data={filteredDinners}
                keyExtractor={(item) => item._id}
                estimatedItemSize={70}
                renderItem={({ item }) => (
                  <DinnerSelectorItem
                    id={item._id}
                    name={item.name}
                    category={item.category}
                    onSelect={handleSelectDinner}
                  />
                )}
              />
            )}
          </View>
        ) : (
          <View className="flex-1 p-4">
            {/* Selected dinner info */}
            <View className="mb-6 p-4 border-2 border-black dark:border-white bg-gray-50 dark:bg-gray-900">
              <Text className="text-sm text-(--color-gray) uppercase tracking-wide mb-1">
                Selected Dinner
              </Text>
              <Text className="text-xl uppercase tracking-wide font-bold">
                {selectedDinner?.name}
              </Text>
            </View>

            {/* Rating */}
            <View className="mb-6">
              <Text className="text-sm text-(--color-gray) uppercase tracking-wide mb-3">
                Rating (optional)
              </Text>
              <RatingSelector value={rating} onChange={setRating} />
            </View>

            {/* Notes */}
            <View className="flex-1">
              <Text className="text-sm text-(--color-gray) uppercase tracking-wide mb-3">
                Notes (optional)
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="How did it go? Any changes?"
                placeholderTextColor="#666"
                multiline
                textAlignVertical="top"
                className="flex-1 border-2 border-black dark:border-white p-4 text-base"
              />
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
