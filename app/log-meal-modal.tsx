import { Text } from "@/components/themed-text";
import { View } from "@/components/themed-view";
import { Pressable, TextInput } from "react-native";
import { memo, useCallback, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LegendList } from "@legendapp/list";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import { useCSSVariable } from "uniwind";

const placeholderTextColor = "#666";
const labelClassName = "text-sm text-(--color-gray) uppercase tracking-wide";

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
          {category ? (
            <Text className="text-sm text-(--color-gray) uppercase tracking-wide mt-1">
              {category}
            </Text>
          ) : null}
        </View>
        <Text className="text-2xl">&gt;</Text>
      </View>
    </Pressable>
  );
});

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

export default function LogMealModal() {
  const router = useRouter();
  const [step, setStep] = useState<"select" | "details">("select");
  const [selectedDinner, setSelectedDinner] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const allDinners = useQuery(api.dinners.getAll) ?? [];
  const recentMeals = useQuery(api.dinnerLogs.getRecentWithDetails, {
    limit: 3,
  });
  const createLog = useMutation(api.dinnerLogs.create);

  const recentDinnerIds = recentMeals?.map((meal) => meal.dinnerId) ?? [];
  const recentDinnerIdSet = useMemo(
    () => new Set(recentDinnerIds),
    [recentDinnerIds],
  );

  const availableDinners = useMemo(
    () => allDinners.filter((dinner) => !recentDinnerIdSet.has(dinner._id)),
    [allDinners, recentDinnerIdSet],
  );

  const filteredDinners = useMemo(() => {
    if (!searchQuery) return availableDinners;
    const normalizedQuery = searchQuery.toLowerCase();
    return availableDinners.filter(
      (dinner) =>
        dinner.name.toLowerCase().includes(normalizedQuery) ||
        (dinner.category?.toLowerCase() || "").includes(normalizedQuery),
    );
  }, [availableDinners, searchQuery]);

  const handleSelectDinner = useCallback((id: string, name: string) => {
    setSelectedDinner({ id, name });
    setStep("details");
  }, []);

  const handleBackToSelection = useCallback(() => {
    setStep("select");
    setSelectedDinner(null);
    setRating(0);
    setNotes("");
  }, []);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handleSubmit = useCallback(async () => {
    if (!selectedDinner) return;

    await createLog({
      dinnerId: selectedDinner.id as any,
      madeAt: Date.now(),
      rating: rating > 0 ? rating : undefined,
      notes: notes || undefined,
    });

    setStep("select");
    setSelectedDinner(null);
    setRating(0);
    setNotes("");
    setSearchQuery("");
    handleClose();
  }, [selectedDinner, rating, notes, createLog, handleClose]);

  const canSave = Boolean(selectedDinner);

  return (
    <View className="flex-1 bg-white dark:bg-[#151718]">
      {step === "select" ? (
        <View className="flex-1">
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
          </View>

          {filteredDinners.length === 0 ? (
            <View className="flex-1 justify-center items-center p-4 gap-2">
              <Text className="text-lg uppercase tracking-wide text-center">
                {searchQuery
                  ? "No dinners found"
                  : "All dinners recently logged"}
              </Text>
              <Pressable onPress={handleClose} className="px-4 py-2">
                <Text className="text-xs uppercase tracking-wider text-(--color-gray)">
                  Close
                </Text>
              </Pressable>
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
        <View className="flex-1 p-4 gap-6">
          <View className="p-4 border-2 border-black dark:border-white bg-gray-50 dark:bg-gray-900">
            <Text className={labelClassName}>Selected Dinner</Text>
            <Text className="text-xl uppercase tracking-wide font-bold mt-1">
              {selectedDinner?.name}
            </Text>
            <Pressable
              onPress={handleBackToSelection}
              className="mt-3 border-2 border-black dark:border-white px-3 py-2 self-start"
            >
              <Text className="text-xs uppercase tracking-wider font-bold">
                Change Dinner
              </Text>
            </Pressable>
          </View>

          <View>
            <Text className={`${labelClassName} mb-3`}>Rating (optional)</Text>
            <RatingSelector value={rating} onChange={setRating} />
          </View>

          <View className="flex-1">
            <Text className={`${labelClassName} mb-3`}>Notes (optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="How did it go? Any changes?"
              placeholderTextColor={placeholderTextColor}
              multiline
              textAlignVertical="top"
              className="flex-1 border-2 border-black dark:border-white p-4 text-base"
            />
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={!canSave}
            className={`border-2 border-black dark:border-white p-4 ${
              canSave ? "bg-black dark:bg-white" : "bg-white dark:bg-[#151718]"
            }`}
          >
            <Text
              className={`text-base uppercase tracking-wider font-bold text-center ${
                canSave
                  ? "text-white dark:text-black"
                  : "text-(--color-gray)/60 dark:text-white/60"
              }`}
            >
              Save
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
