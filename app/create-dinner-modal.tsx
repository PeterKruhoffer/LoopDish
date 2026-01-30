import { Text } from "@/components/themed-text";
import { View } from "@/components/themed-view";
import { FullScreenLoading } from "@/components/full-screen-loading";
import {
  Pressable,
  TextInput,
  ScrollView,
  type TextInputProps,
} from "react-native";
import { useState, useCallback, useMemo, type ReactNode } from "react";
import { useRouter } from "expo-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

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

export default function CreateDinnerModal() {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [tag, setTag] = useState<string>("");
  const [cookingTimeMinutes, setCookingTimeMinutes] = useState<string>("");

  const createDinner = useMutation(api.dinners.create);
  const categorySuggestions = useQuery(api.dinners.getCategories);

  const resetForm = useCallback(() => {
    setName("");
    setCategory("");
    setTag("");
    setCookingTimeMinutes("");
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    router.back();
  }, [resetForm, router]);

  const handleSubmit = useCallback(async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const trimmedCategory = category.trim();
    const trimmedTag = tag.trim();
    const trimmedCookTime = cookingTimeMinutes.trim();

    const parsedCookTime = trimmedCookTime
      ? Number.parseInt(trimmedCookTime, 10)
      : undefined;

    await createDinner({
      name: trimmedName,
      category: trimmedCategory || undefined,
      tag: trimmedTag || undefined,
      cookingTimeMinutes: Number.isFinite(parsedCookTime)
        ? parsedCookTime
        : undefined,
    });

    handleClose();
  }, [name, category, tag, cookingTimeMinutes, createDinner, handleClose]);

  const canSave = name.trim().length > 0;
  const normalizedCategory = category.trim().toLowerCase();
  const limitedSuggestions = useMemo(() => {
    if (!categorySuggestions || categorySuggestions.length === 0) return [];
    if (!normalizedCategory) return categorySuggestions.slice(0, 7);

    return categorySuggestions
      .filter((item) => item.toLowerCase().includes(normalizedCategory))
      .slice(0, 7);
  }, [categorySuggestions, normalizedCategory]);

  const handleSelectCategory = useCallback((value: string) => {
    setCategory(value);
  }, []);

  if (categorySuggestions === undefined) {
    return <FullScreenLoading />;
  }

  return (
    <ScrollView
      className="flex-1 min-h-screen bg-white dark:bg-black"
      contentContainerClassName="p-4 gap-4 pb-8"
      keyboardShouldPersistTaps="handled"
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
        label="Tag (optional)"
        placeholder="e.g. Chicken, Vegetarian"
        value={tag}
        onChangeText={setTag}
      />

      <Field
        label="Cooking Time (minutes, optional)"
        placeholder="e.g. 45"
        value={cookingTimeMinutes}
        onChangeText={setCookingTimeMinutes}
        keyboardType="number-pad"
      />

      <Pressable
        onPress={handleSubmit}
        disabled={!canSave}
        className={`mt-2 border-2 border-black dark:border-white p-4 ${
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
    </ScrollView>
  );
}
