import { Text } from "@/components/themed-text";
import { View } from "@/components/themed-view";
import { Modal, Pressable, TextInput, ScrollView, type TextInputProps } from "react-native";
import { useState, useCallback, useMemo, type ReactNode } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Create Dinner form sheet modal
// Following vercel-react-native-skills: ui-native-modals

interface CreateDinnerModalProps {
  visible: boolean;
  onClose: () => void;
}

const placeholderTextColor = "#666";
const fieldLabelClassName =
  "text-xs uppercase tracking-wider text-(--color-gray)";
const fieldInputClassName =
  "border-2 border-black dark:border-white p-3 text-base";
const suggestionLabelClassName =
  "text-[10px] uppercase tracking-wider text-(--color-gray)";

interface FieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: TextInputProps["keyboardType"];
  children?: ReactNode;
}

function Field({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  children,
}: FieldProps) {
  return (
    <View className="gap-2">
      <Text className={fieldLabelClassName}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        keyboardType={keyboardType}
        className={fieldInputClassName}
      />
      {children}
    </View>
  );
}

interface CategorySuggestionsProps {
  suggestions: string[];
  normalizedCategory: string;
  onSelect: (value: string) => void;
}

function CategorySuggestions({
  suggestions,
  normalizedCategory,
  onSelect,
}: CategorySuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <View className="gap-2">
      <Text className={suggestionLabelClassName}>Suggestions</Text>
      <View className="flex-row flex-wrap gap-2">
        {suggestions.map((item) => {
          const isSelected = item.toLowerCase() === normalizedCategory;
          return (
            <Pressable
              key={item}
              onPress={() => onSelect(item)}
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
  );
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
  const limitedSuggestions = useMemo(() => {
    if (categorySuggestions.length === 0) return [];
    if (!normalizedCategory) return categorySuggestions.slice(0, 7);

    return categorySuggestions
      .filter((item) => item.toLowerCase().includes(normalizedCategory))
      .slice(0, 7);
  }, [categorySuggestions, normalizedCategory]);

  const handleSelectCategory = useCallback((value: string) => {
    setCategory(value);
  }, []);

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
          contentInsetAdjustmentBehavior="automatic"
        >
          <Field
            label="Dinner Name"
            placeholder="e.g. Lemon Chicken"
            value={name}
            onChangeText={setName}
          />

          <Field
            label="Category (optional)"
            placeholder="e.g. Pasta, Vegetarian"
            value={category}
            onChangeText={setCategory}
          >
            <CategorySuggestions
              suggestions={limitedSuggestions}
              normalizedCategory={normalizedCategory}
              onSelect={handleSelectCategory}
            />
          </Field>

          <Field
            label="Estimated Cost (optional)"
            placeholder="e.g. 12.50"
            value={estimatedCost}
            onChangeText={setEstimatedCost}
            keyboardType="decimal-pad"
          />

          <Field
            label="Cooking Time (minutes, optional)"
            placeholder="e.g. 45"
            value={cookingTimeMinutes}
            onChangeText={setCookingTimeMinutes}
            keyboardType="number-pad"
          />
        </ScrollView>
      </View>
    </Modal>
  );
}
