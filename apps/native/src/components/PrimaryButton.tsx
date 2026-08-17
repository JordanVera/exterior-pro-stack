import { ActivityIndicator, Pressable, Text } from "react-native";
import { colors } from "@/lib/theme";

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = "primary",
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger";
}) {
  const colorsClass =
    variant === "danger"
      ? "bg-red-600"
      : variant === "secondary"
        ? "border border-white/20 bg-navy-700"
        : "bg-brand-lime";
  const text =
    variant === "secondary" || variant === "danger"
      ? "text-white"
      : "text-brand-ink";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`min-h-[56px] items-center justify-center rounded-2xl px-4 active:opacity-80 ${colorsClass} ${disabled || loading ? "opacity-50" : ""}`}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? colors.ink : "#fff"}
        />
      ) : (
        <Text className={`text-lg font-bold ${text}`}>{label}</Text>
      )}
    </Pressable>
  );
}
