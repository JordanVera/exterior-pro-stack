import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, Text } from "react-native";
import { colors } from "@/lib/theme";

/**
 * Labelled icon action, sized for gloved taps. Used side by side for the
 * Navigate / Call pair on a job.
 */
export function IconButton({
  icon,
  label,
  onPress,
  tone = "neutral",
  className = "",
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  tone?: "neutral" | "accent";
  className?: string;
}) {
  const accent = tone === "accent";
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
          () => undefined,
        );
        onPress();
      }}
      className={`flex-row items-center justify-center gap-2 rounded-2xl border px-4 py-3.5 active:opacity-80 ${
        accent
          ? "border-brand-lime/40 bg-brand-lime/15"
          : "border-line-strong bg-surface-raised"
      } ${className}`}
    >
      <Ionicons
        name={icon}
        size={18}
        color={accent ? colors.lime : colors.mist}
      />
      <Text
        className={`font-semibold text-[15px] ${
          accent ? "text-brand-lime" : "text-white"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
