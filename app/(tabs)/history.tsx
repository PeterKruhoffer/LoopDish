import { View } from "@/components/themed-view";
import { Text } from "@/components/themed-text";
import { DinnerLogCard } from "@/components/dinner-log-card";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LegendList } from "@legendapp/list";
import { useCallback, useMemo } from "react";

interface DinnerHistoryItem {
  _id: string;
  dinnerId: string;
  dinner: {
    _id: string;
    name: string;
    category?: string;
  } | null;
  madeAt: number;
  rating?: number;
  notes?: string;
}

export default function History() {
  const params = useLocalSearchParams<{ dinnerId?: string }>();
  const rawDinnerId = params.dinnerId;
  const dinnerId = useMemo(() => {
    if (Array.isArray(rawDinnerId)) {
      return rawDinnerId[0];
    }
    return rawDinnerId;
  }, [rawDinnerId]);

  const historyLogs = useQuery(
    api.dinnerLogs.getHistoryWithDetails,
    dinnerId ? { dinnerId: dinnerId as any } : {},
  );

  const logsWithDinner = useMemo(() => {
    return (historyLogs ?? []).filter((log) => log.dinner);
  }, [historyLogs]);

  const dinnerName = useMemo(() => {
    if (!dinnerId) return null;
    return logsWithDinner[0]?.dinner?.name ?? null;
  }, [dinnerId, logsWithDinner]);

  const isFiltered = Boolean(dinnerId);
  const subtitle = isFiltered
    ? dinnerName
      ? `History for ${dinnerName}`
      : "Filtered history"
    : "Every dish you've made";

  const emptyTitle = isFiltered
    ? "No meals for this dish yet"
    : "No meals logged yet";
  const emptyBody = isFiltered
    ? "Log it from Home to start its history"
    : "Log a meal to start your history";

  const renderItem = useCallback(
    ({ item, index }: { item: DinnerHistoryItem; index: number }) => {
      if (!item.dinner) return null;
      const isLast = index === logsWithDinner.length - 1;
      const containerClassName = isLast ? "mb-24" : "mb-3";

      return (
        <View className={containerClassName}>
          <DinnerLogCard
            id={item._id}
            dinnerId={item.dinnerId}
            dinnerName={item.dinner.name}
            category={item.dinner.category}
            madeAt={item.madeAt}
            rating={item.rating}
            notes={item.notes}
            variant="full"
            href={{ pathname: "/history/[id]", params: { id: item._id } }}
          />
        </View>
      );
    },
    [logsWithDinner.length],
  );

  if (logsWithDinner.length === 0) {
    return <EmptyState emptyTitle={emptyTitle} emptyBody={emptyBody} />;
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <View className="flex-1 px-4 pt-4">
        <View className="mb-3">
          <Text className="text-xs uppercase tracking-wide text-(--color-gray)">
            {subtitle}
          </Text>
        </View>
        <LegendList
          data={logsWithDinner}
          keyExtractor={(item) => item._id}
          estimatedItemSize={140}
          renderItem={renderItem}
        />
      </View>
    </View>
  );
}

function EmptyState({
  emptyTitle,
  emptyBody,
}: {
  emptyTitle: string;
  emptyBody: string;
}) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <Text className="text-base uppercase tracking-wide text-center">
        {emptyTitle}
      </Text>
      <Text className="text-xs uppercase tracking-wide text-(--color-gray) text-center mt-2">
        {emptyBody}
      </Text>
    </View>
  );
}
