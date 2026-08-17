import { ActivityIndicator, Pressable, Text } from "react-native";

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
  const colors =
    variant === "danger"
      ? "bg-red-600"
      : variant === "secondary"
        ? "border border-white/20 bg-navy-700"
        : "bg-cyan-500";
  const text =
    variant === "secondary" || variant === "danger"
      ? "text-white"
      : "text-navy";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`min-h-[56px] items-center justify-center rounded-2xl px-4 active:opacity-80 ${colors} ${disabled || loading ? "opacity-50" : ""}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#0b1220" : "#fff"} />
      ) : (
        <Text className={`text-lg font-bold ${text}`}>{label}</Text>
      )}
    </Pressable>
  );
}
