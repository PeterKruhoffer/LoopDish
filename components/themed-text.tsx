import { Text, type TextProps } from "react-native";

export type ThemedTextProps = TextProps & {
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
};

export function ThemedText({
  style,
  type = "default",
  className,
  ...rest
}: ThemedTextProps) {
  const baseClasses = "text-black dark:text-white";

  const typeClasses = {
    default: "text-base leading-6",
    defaultSemiBold: "text-base leading-6 font-semibold",
    title: "text-[32px] font-bold leading-8",
    subtitle: "text-xl font-bold",
    link: "leading-[30px] text-base text-[#0a7ea4]",
  };

  return (
    <Text
      className={`${baseClasses} ${typeClasses[type]} ${className || ""}`}
      style={style}
      {...rest}
    />
  );
}
