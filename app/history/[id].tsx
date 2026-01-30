import { Text } from "@/components/themed-text";
import { View } from "@/components/themed-view";
import { FullScreenLoading } from "@/components/full-screen-loading";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Pressable, ScrollView } from "react-native";
import { DateTime } from "luxon";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";
import { useCSSVariable } from "uniwind";
import { useMemo, type ReactNode } from "react";

export default function HistoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const tabActiveColor = useCSSVariable("--color-tab-active");
  const logId = useMemo(() => {
    if (!id) return undefined;
    return Array.isArray(id) ? id[0] : id;
  }, [id]);

  const log = useQuery(
    api.dinnerLogs.getById,
    logId ? { id: logId as any } : ("skip" as any),
  );

  const dinner = useQuery(
    api.dinners.getById,
    log ? { id: log.dinnerId } : ("skip" as any),
  );

  const madeAtLabel = useMemo(() => {
    if (!log) return null;
    const date = DateTime.fromMillis(log.madeAt);
    const dateLabel = date.toLocaleString(DateTime.DATE_FULL);
    const timeLabel = date.toLocaleString(DateTime.TIME_SIMPLE);
    return `${dateLabel} · ${timeLabel}`;
  }, [log]);

  const relativeLabel = useMemo(() => {
    if (!log) return null;
    const date = DateTime.fromMillis(log.madeAt);
    return date.toRelative() || date.toFormat("MMM d");
  }, [log]);

  if (!logId) {
    return (
      <EmptyState
        title="Missing history entry"
        body="Go back and select a meal to view"
        onBack={() => router.back()}
      />
    );
  }

  if (log === undefined || dinner === undefined) {
    return <FullScreenLoading />;
  }

  if (!log || !dinner) {
    return (
      <EmptyState
        title="Log not found"
        body="This entry might have been removed"
        onBack={() => router.back()}
      />
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-black"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      <View className="border-2 border-black dark:border-white p-4 bg-gray-50 dark:bg-gray-900">
        <Text className="text-xs uppercase tracking-wider text-(--color-gray)">
          Dinner
        </Text>
        <Text className="text-2xl uppercase tracking-wide font-bold mt-1">
          {dinner.name}
        </Text>
        {dinner.category ? (
          <View className="self-start bg-black dark:bg-white px-2 py-1 mt-3">
            <Text className="text-white dark:text-black text-xs uppercase tracking-wider font-bold">
              {dinner.category}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="mt-4 border-2 border-black dark:border-white p-4">
        <InfoRow label="Made">
          <Text className="text-base uppercase tracking-wide">
            {relativeLabel}
          </Text>
          <Text className="text-xs uppercase tracking-wide text-(--color-gray) mt-1">
            {madeAtLabel}
          </Text>
        </InfoRow>
        <InfoRow label="Rating">
          {log.rating ? (
            <View className="flex-row items-center gap-2">
              <IconSymbol
                name="star.fill"
                size={16}
                color={tabActiveColor as string}
              />
              <Text className="text-base uppercase tracking-wide">
                {log.rating}/5
              </Text>
            </View>
          ) : (
            <Text className="text-xs uppercase tracking-wide text-(--color-gray)">
              Not rated
            </Text>
          )}
        </InfoRow>
        <InfoRow label="Servings">
          <Text className="text-base uppercase tracking-wide">
            {log.servings ? log.servings : "Not set"}
          </Text>
        </InfoRow>
        <InfoRow label="Tag">
          <Text className="text-base uppercase tracking-wide">
            {dinner.tag ? dinner.tag : "Not set"}
          </Text>
        </InfoRow>
        <InfoRow label="Cook time">
          <Text className="text-base uppercase tracking-wide">
            {dinner.cookingTimeMinutes
              ? `${dinner.cookingTimeMinutes} min`
              : "Not set"}
          </Text>
        </InfoRow>
      </View>

      <View className="mt-4 border-2 border-black dark:border-white p-4 bg-white dark:bg-black">
        <Text className="text-xs uppercase tracking-wider text-(--color-gray)">
          Notes
        </Text>
        {log.notes ? (
          <Text className="text-base mt-3 leading-6">{log.notes}</Text>
        ) : (
          <Text className="text-xs uppercase tracking-wide text-(--color-gray) mt-3">
            No notes added
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View className="mb-4 last:mb-0">
      <Text className="text-xs uppercase tracking-wider text-(--color-gray)">
        {label}
      </Text>
      <View className="mt-2">{children}</View>
    </View>
  );
}

function EmptyState({
  title,
  body,
  onBack,
}: {
  title: string;
  body: string;
  onBack?: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center px-6 bg-white dark:bg-black">
      <Text className="text-base uppercase tracking-wide text-center">
        {title}
      </Text>
      <Text className="text-xs uppercase tracking-wide text-(--color-gray) text-center mt-2">
        {body}
      </Text>
      {onBack ? (
        <Pressable
          onPress={onBack}
          className="mt-4 border-2 border-black dark:border-white px-3 py-2"
        >
          <Text className="text-xs uppercase tracking-wider font-bold">
            Back
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
