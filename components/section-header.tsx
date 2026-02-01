import { Text } from "@/components/themed-text";
import { View } from "@/components/themed-view";
import { Pressable } from "react-native";
import { Link, type Href } from "expo-router";
import { memo } from "react";

interface SectionHeaderRootProps {
  children: React.ReactNode;
}

function SectionHeaderRoot({ children }: SectionHeaderRootProps) {
  return (
    <View className="flex-row items-center justify-between mb-3">
      {children}
    </View>
  );
}

interface SectionHeaderTitleProps {
  children: string;
}

function SectionHeaderTitle({ children }: SectionHeaderTitleProps) {
  return (
    <Text
      type="defaultSemiBold"
      className="text-lg uppercase tracking-wider font-bold"
    >
      {children}
    </Text>
  );
}

interface SectionHeaderActionProps {
  href: Href;
  label: string;
}

function SectionHeaderAction({ href, label }: SectionHeaderActionProps) {
  return (
    <Link href={href} asChild>
      <Pressable>
        <Text className="text-sm text-(--color-gray) dark:text-white uppercase tracking-wide font-semibold">
          {label}
        </Text>
      </Pressable>
    </Link>
  );
}

export const SectionHeader = {
  Root: memo(SectionHeaderRoot),
  Title: memo(SectionHeaderTitle),
  Action: memo(SectionHeaderAction),
};
