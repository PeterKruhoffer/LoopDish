import { ActivityIndicator } from "react-native";
import { View } from "@/components/themed-view";
import { Text } from "@/components/themed-text";

type FullScreenLoadingProps = {
  label?: string;
};

export function FullScreenLoading({
  label = "Loading",
}: FullScreenLoadingProps) {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black">
      <ActivityIndicator size="large" />
      <Text className="mt-3 uppercase tracking-wide text-(--color-gray)">
        {label}
      </Text>
    </View>
  );
}
