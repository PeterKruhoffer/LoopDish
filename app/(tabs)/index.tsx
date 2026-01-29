import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Index() {
  const dinners = useQuery(api.dinners.getAll);
  return (
    <ThemedView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ThemedText>Edit app/index.tsx to edit this screen.</ThemedText>

      <ThemedView className="border border-red-500 p-8 h-4 w-4"></ThemedView>
      {dinners?.map(({ _id, name }) => (
        <ThemedText key={_id}>{name}</ThemedText>
      ))}
    </ThemedView>
  );
}
