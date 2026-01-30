import { Text } from "@/components/themed-text";
import { View } from "@/components/themed-view";
import { Alert, Pressable, ScrollView, TextInput } from "react-native";
import { useCallback, useMemo, useState } from "react";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import { useCSSVariable } from "uniwind";

const placeholderTextColor = "#666";
const labelClassName = "text-sm text-(--color-gray) uppercase tracking-wide";

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

export default function LogMealDetailsScreen() {
  const router = useRouter();
  const { dinnerId } = useLocalSearchParams<{ dinnerId?: string }>();
  const [rating, setRating] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  const resolvedDinnerId = useMemo(() => {
    if (!dinnerId) return undefined;
    return Array.isArray(dinnerId) ? dinnerId[0] : dinnerId;
  }, [dinnerId]);

  const dinner = useQuery(
    api.dinners.getById,
    resolvedDinnerId ? { id: resolvedDinnerId as any } : ("skip" as any),
  );

  const createLog = useMutation(api.dinnerLogs.create);
  const removeDinner = useMutation(api.dinners.remove);

  const handleSubmit = useCallback(async () => {
    if (!resolvedDinnerId) return;

    await createLog({
      dinnerId: resolvedDinnerId as any,
      madeAt: Date.now(),
      rating: rating > 0 ? rating : undefined,
      notes: notes || undefined,
    });

    router.back();
  }, [resolvedDinnerId, rating, notes, createLog, router]);

  const handleDeleteDinner = useCallback(() => {
    if (!resolvedDinnerId) return;
    Alert.alert("Delete dinner?", "This removes the dinner and all its logs.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await removeDinner({ id: resolvedDinnerId as any });
          router.back();
        },
      },
    ]);
  }, [resolvedDinnerId, removeDinner, router]);

  const canSave = Boolean(resolvedDinnerId);

  if (!resolvedDinnerId) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-white dark:bg-black">
        <Text className="text-base uppercase tracking-wide text-center">
          Missing dinner selection
        </Text>
        <Text className="text-xs uppercase tracking-wide text-(--color-gray) text-center mt-2">
          Go back and choose a dinner to log
        </Text>
        <Link href={"/log-meal" as const} replace asChild>
          <Pressable className="mt-4 border-2 border-black dark:border-white px-3 py-2">
            <Text className="text-xs uppercase tracking-wider font-bold">
              Back to list
            </Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  if (dinner === undefined) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-white dark:bg-black">
        <Text className="text-base uppercase tracking-wide text-center">
          Loading dinner
        </Text>
        <Text className="text-xs uppercase tracking-wide text-(--color-gray) text-center mt-2">
          Pulling up the details
        </Text>
      </View>
    );
  }

  if (!dinner) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-white dark:bg-black">
        <Text className="text-base uppercase tracking-wide text-center">
          Dinner not found
        </Text>
        <Text className="text-xs uppercase tracking-wide text-(--color-gray) text-center mt-2">
          It may have been removed
        </Text>
        <Link href={"/log-meal" as const} replace asChild>
          <Pressable className="mt-4 border-2 border-black dark:border-white px-3 py-2">
            <Text className="text-xs uppercase tracking-wider font-bold">
              Back to list
            </Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-black"
      contentContainerClassName="p-4 gap-6 pb-8"
      keyboardShouldPersistTaps="handled"
    >
      <View className="p-4 border-2 border-black dark:border-white bg-gray-50 dark:bg-gray-900">
        <Text className={labelClassName}>Selected Dinner</Text>
        <Text className="text-xl uppercase tracking-wide font-bold mt-1">
          {dinner.name}
        </Text>
        <Link href={"/log-meal" as const} replace asChild>
          <Pressable className="mt-3 border-2 border-black dark:border-white px-3 py-2 self-start">
            <Text className="text-xs uppercase tracking-wider font-bold">
              Change Dinner
            </Text>
          </Pressable>
        </Link>
      </View>

      <View>
        <Text className={`${labelClassName} mb-3`}>Rating (optional)</Text>
        <RatingSelector value={rating} onChange={setRating} />
      </View>

      <View className="min-h-40">
        <Text className={`${labelClassName} mb-3`}>Notes (optional)</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="How did it go? Any changes?"
          placeholderTextColor={placeholderTextColor}
          multiline
          textAlignVertical="top"
          className="min-h-40 border-2 border-black dark:border-white p-4 text-base"
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

      <Pressable
        onPress={handleDeleteDinner}
        className="border-2 border-red-600 p-4"
      >
        <Text className="text-base uppercase tracking-wider font-bold text-center text-red-600">
          Delete Dinner
        </Text>
      </Pressable>
    </ScrollView>
  );
}
