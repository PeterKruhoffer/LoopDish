import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Index() {
  const tasks = useQuery(api.tasks.get);
  return (
    <ThemedView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ThemedText>Edit app/index.tsx to edit this screen.</ThemedText>
      {tasks?.map(({ _id, text }) => (
        <ThemedText key={_id}>{text}</ThemedText>
      ))}
    </ThemedView>
  );
}
