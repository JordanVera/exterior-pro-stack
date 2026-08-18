import type { ReactNode } from "react";
import { Pressable, View } from "react-native";

/**
 * Base surface. Every panel in the app sits on this so the border and radius
 * stay consistent instead of being retyped per screen.
 */
export function Card({
  children,
  className = "",
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "raised" | "accent";
}) {
  const toneClass =
    tone === "accent"
      ? "border-brand-lime/30 bg-brand-lime/[0.06]"
      : tone === "raised"
        ? "border-line-strong bg-surface-raised"
        : "border-line bg-surface";

  return (
    <View className={`rounded-3xl border p-5 ${toneClass} ${className}`}>
      {children}
    </View>
  );
}

export function PressableCard({
  children,
  onPress,
  className = "",
  tone = "default",
}: {
  children: ReactNode;
  onPress: () => void;
  className?: string;
  tone?: "default" | "raised" | "accent";
}) {
  const toneClass =
    tone === "accent"
      ? "border-brand-lime/30 bg-brand-lime/[0.06]"
      : tone === "raised"
        ? "border-line-strong bg-surface-raised"
        : "border-line bg-surface";

  return (
    <Pressable
      onPress={onPress}
      className={`rounded-3xl border p-5 active:opacity-80 ${toneClass} ${className}`}
    >
      {children}
    </Pressable>
  );
}
