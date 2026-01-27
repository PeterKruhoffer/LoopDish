import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <Stack>
      <StatusBar />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
