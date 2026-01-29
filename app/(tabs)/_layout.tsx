import { HapticTab } from "@/components/haptic-tab";
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
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="clock.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
