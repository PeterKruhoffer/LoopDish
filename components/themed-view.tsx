import { View as RNView, type ViewProps } from "react-native";

export type ThemedViewProps = ViewProps;

export function View({ style, className, ...otherProps }: ThemedViewProps) {
  return (
    <RNView
      className={`bg-white dark:bg-black ${className || ""}`}
      style={style}
      {...otherProps}
    />
  );
}
