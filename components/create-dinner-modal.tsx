import { Text } from "@/components/themed-text";
import { View } from "@/components/themed-view";
import { Modal, Pressable, TextInput, ScrollView } from "react-native";
import { useState, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Create Dinner form sheet modal
// Following vercel-react-native-skills: ui-native-modals

interface CreateDinnerModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CreateDinnerModal({
  visible,
  onClose,
}: CreateDinnerModalProps) {
  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [estimatedCost, setEstimatedCost] = useState<string>("");
  const [cookingTimeMinutes, setCookingTimeMinutes] = useState<string>("");

  const createDinner = useMutation(api.dinners.create);
  const categorySuggestions = useQuery(api.dinners.getCategories) ?? [];

  const resetForm = useCallback(() => {
    setName("");
    setCategory("");
    setEstimatedCost("");
    setCookingTimeMinutes("");
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleSubmit = useCallback(async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const trimmedCategory = category.trim();
    const trimmedCost = estimatedCost.trim();
    const trimmedCookTime = cookingTimeMinutes.trim();

    const parsedCost = trimmedCost ? Number.parseFloat(trimmedCost) : undefined;
    const parsedCookTime = trimmedCookTime
      ? Number.parseInt(trimmedCookTime, 10)
      : undefined;

    await createDinner({
      name: trimmedName,
      category: trimmedCategory || undefined,
      estimatedCost: Number.isFinite(parsedCost) ? parsedCost : undefined,
      cookingTimeMinutes: Number.isFinite(parsedCookTime)
        ? parsedCookTime
        : undefined,
    });

    handleClose();
  }, [name, category, estimatedCost, cookingTimeMinutes, createDinner, handleClose]);

  const canSave = name.trim().length > 0;
  const normalizedCategory = category.trim().toLowerCase();
  const filteredSuggestions = normalizedCategory
    ? categorySuggestions.filter((item) =>
        item.toLowerCase().includes(normalizedCategory),
      )
    : categorySuggestions;
  const limitedSuggestions = filteredSuggestions.slice(0, 7);

  return (
    <Modal
      visible={visible}
      presentationStyle="formSheet"
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-white dark:bg-[#151718]">
        <View className="flex-row items-center justify-between p-4 border-b-2 border-black dark:border-white">
          <Pressable onPress={handleClose} className="p-2">
            <Text className="text-base uppercase tracking-wide font-bold text-(--color-gray) dark:text-white">
              Cancel
            </Text>
          </Pressable>

          <Text className="text-lg uppercase tracking-wider font-bold">
            Create Dinner
          </Text>

          <Pressable
            onPress={handleSubmit}
            disabled={!canSave}
            className="p-2"
          >
            <Text
              className={`text-base uppercase tracking-wide font-bold ${
                canSave
                  ? "text-(--color-gray) dark:text-white"
                  : "text-(--color-gray)/50 dark:text-white/50"
              }`}
            >
              Save
            </Text>
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="p-4 gap-4"
          keyboardShouldPersistTaps="handled"
        >
          <View className="gap-2">
            <Text className="text-xs uppercase tracking-wider text-(--color-gray)">
              Dinner Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Lemon Chicken"
              placeholderTextColor="#666"
              className="border-2 border-black dark:border-white p-3 text-base"
            />
          </View>

          <View className="gap-2">
            <Text className="text-xs uppercase tracking-wider text-(--color-gray)">
              Category (optional)
            </Text>
            <TextInput
              value={category}
              onChangeText={setCategory}
              placeholder="e.g. Pasta, Vegetarian"
              placeholderTextColor="#666"
              className="border-2 border-black dark:border-white p-3 text-base"
            />
            {limitedSuggestions.length > 0 ? (
              <View className="gap-2">
                <Text className="text-[10px] uppercase tracking-wider text-(--color-gray)">
                  Suggestions
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {limitedSuggestions.map((item) => {
                    const isSelected =
                      item.toLowerCase() === normalizedCategory &&
                      normalizedCategory.length > 0;
                    return (
                      <Pressable
                        key={item}
                        onPress={() => setCategory(item)}
                        className={`border-2 border-black dark:border-white px-3 py-2 ${
                          isSelected
                            ? "bg-black dark:bg-white"
                            : "bg-white dark:bg-[#151718]"
                        }`}
                      >
                        <Text
                          className={`text-xs uppercase tracking-wider font-bold ${
                            isSelected
                              ? "text-white dark:text-black"
                              : "text-black dark:text-white"
                          }`}
                        >
                          {item}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}
          </View>

          <View className="gap-2">
            <Text className="text-xs uppercase tracking-wider text-(--color-gray)">
              Estimated Cost (optional)
            </Text>
            <TextInput
              value={estimatedCost}
              onChangeText={setEstimatedCost}
              placeholder="e.g. 12.50"
              placeholderTextColor="#666"
              keyboardType="decimal-pad"
              className="border-2 border-black dark:border-white p-3 text-base"
            />
          </View>

          <View className="gap-2">
            <Text className="text-xs uppercase tracking-wider text-(--color-gray)">
              Cooking Time (minutes, optional)
            </Text>
            <TextInput
              value={cookingTimeMinutes}
              onChangeText={setCookingTimeMinutes}
              placeholder="e.g. 45"
              placeholderTextColor="#666"
              keyboardType="number-pad"
              className="border-2 border-black dark:border-white p-3 text-base"
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
