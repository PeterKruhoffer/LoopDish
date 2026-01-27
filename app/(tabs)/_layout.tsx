import { HapticTab } from "@/components/haptic-tab";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import { Tabs } from "expo-router";
import { useCSSVariable } from "uniwind";

export default function TabLayout() {
  const tabActiveColor = useCSSVariable("--color-tab-active");

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabActiveColor as string,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () => (
          <ThemedView className="h-full w-full" />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="chart.bar.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
