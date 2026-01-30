import { Text } from "@/components/themed-text";
import { View } from "@/components/themed-view";
import { Pressable } from "react-native";
import { Link } from "expo-router";
import { memo } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol.ios";

// Brutalist quick action buttons using compound component pattern
// Following vercel-composition-patterns: architecture-compound-components

// Context for quick action styling
interface QuickActionContextValue {
  variant: "primary" | "secondary";
  onPress?: () => void;
}

// Root component that determines layout
interface QuickActionGridProps {
  children: React.ReactNode;
}

function QuickActionGrid({ children }: QuickActionGridProps) {
  return <View className="flex-row gap-4 px-4">{children}</View>;
}

// Individual action button
interface QuickActionButtonProps {
  icon: string;
  label: string;
  variant?: "primary" | "secondary";
  onPress?: () => void;
}

function QuickActionButton({
  icon,
  label,
  variant = "primary",
  onPress,
}: QuickActionButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 h-30 justify-center items-center border-2 border-black dark:border-white ${
        isPrimary ? "bg-black dark:bg-white" : "bg-white dark:bg-[#151718]"
      }`}
    >
      <IconSymbol
        name={icon as any}
        size={32}
        color={isPrimary ? "#fff" : "#000"}
      />
      <Text
        className={`mt-2 text-sm uppercase tracking-wider font-bold ${
          isPrimary
            ? "text-white dark:text-black"
            : "text-black dark:text-white"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// Link variant for navigation
interface QuickActionLinkProps {
  icon: string;
  label: string;
  href: string;
  variant?: "primary" | "secondary";
}

function QuickActionLink({
  icon,
  label,
  href,
  variant = "secondary",
}: QuickActionLinkProps) {
  const isPrimary = variant === "primary";

  return (
    <Link href={href as any} asChild>
      <Pressable
        className={`flex-1 h-30 justify-center items-center border-2 border-black dark:border-white ${
          isPrimary ? "bg-black dark:bg-white" : "bg-white dark:bg-black"
        }`}
      >
        <IconSymbol
          name={icon as any}
          size={32}
          color={isPrimary ? "#fff" : "#000"}
        />
        <Text
          className={`mt-2 text-sm uppercase tracking-wider font-bold ${
            isPrimary
              ? "text-white dark:text-black"
              : "text-black dark:text-white"
          }`}
        >
          {label}
        </Text>
      </Pressable>
    </Link>
  );
}

// Export as compound component
export const QuickAction = {
  Grid: memo(QuickActionGrid),
  Button: memo(QuickActionButton),
  Link: memo(QuickActionLink),
};
