import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCSSVariable } from "uniwind";
import "../global.css";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

export default function RootLayout() {
  const headerBackground = useCSSVariable("--color-header-background");
  const headerText = useCSSVariable("--color-header-text");

  return (
    <ConvexProvider client={convex}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: headerBackground as string,
          },
          headerTintColor: headerText as string,
        }}
      >
        <StatusBar style="auto" />
        <Stack.Screen name="(tabs)" options={{ title: "LoopDish" }} />
        <Stack.Screen
          name="create-dinner"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="log-meal"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="plan-dinner"
          options={{
            presentation: "modal",
            headerShown: false,
          }}
        />
      </Stack>
    </ConvexProvider>
  );
}
